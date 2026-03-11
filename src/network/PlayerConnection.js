/**
 * PlayerConnection — PeerJS client that connects to a host
 */
import { Peer } from 'peerjs';

const PEER_PREFIX = 'preguntador-';

export class PlayerConnection {
    constructor() {
        this.peer = null;
        this.connection = null;
        this.listeners = new Set();
        this.connectTimeoutId = null;
    }

    on(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    emit(event, data) {
        this.listeners.forEach((fn) => fn(event, data));
    }

    async connect(roomCode, playerName) {
        return new Promise((resolve, reject) => {
            const hostPeerId = PEER_PREFIX + roomCode.toLowerCase().trim();
            let settled = false;

            const clearConnectTimeout = () => {
                if (this.connectTimeoutId) {
                    clearTimeout(this.connectTimeoutId);
                    this.connectTimeoutId = null;
                }
            };

            const resolveOnce = (payload = {}) => {
                if (settled) return;
                settled = true;
                clearConnectTimeout();
                resolve({
                    playerId: payload.playerId || this.peer?.id || '',
                });
            };

            const rejectOnce = (error) => {
                if (settled) return;
                settled = true;
                clearConnectTimeout();
                reject(error);
            };

            this.peer = new Peer(undefined, {
                debug: 0,
            });

            this.peer.on('open', () => {
                console.log('[Player] My peer ID:', this.peer.id);

                this.connection = this.peer.connect(hostPeerId, {
                    reliable: true,
                });

                this.connection.on('open', () => {
                    console.log('[Player] Connected to host');
                    this.connection.send({
                        type: 'player-join',
                        payload: { name: playerName },
                    });
                });

                this.connection.on('data', (data) => {
                    if (data?.type === 'join-confirmed') {
                        this.emit('connected', data.payload || {});
                        resolveOnce(data.payload || {});
                        return;
                    }

                    if (data?.type === 'join-rejected') {
                        const error = new Error(data.payload?.message || 'join-rejected');
                        error.code = data.payload?.code || 'join-rejected';
                        this.emit('error', { error });
                        rejectOnce(error);
                        return;
                    }

                    this.emit('message', data);
                });

                this.connection.on('close', () => {
                    if (!settled) {
                        const error = new Error('connection-closed');
                        error.code = 'connection-closed';
                        rejectOnce(error);
                    }
                    this.emit('disconnected', {});
                });

                this.connection.on('error', (err) => {
                    console.error('[Player] Connection error:', err);
                    err.code = err.code || err.type || 'connection-error';
                    this.emit('error', { error: err });
                    rejectOnce(err);
                });

                this.connectTimeoutId = setTimeout(() => {
                    if (!settled) {
                        const error = new Error('connection-timeout');
                        error.code = 'connection-timeout';
                        rejectOnce(error);
                    }
                }, 10000);
            });

            this.peer.on('error', (err) => {
                console.error('[Player] Peer error:', err);
                err.code = err.code || err.type || 'peer-error';
                this.emit('error', { error: err });
                rejectOnce(err);
            });
        });
    }

    send(data) {
        if (this.connection && this.connection.open) {
            this.connection.send(data);
        }
    }

    destroy() {
        if (this.connectTimeoutId) {
            clearTimeout(this.connectTimeoutId);
            this.connectTimeoutId = null;
        }
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
    }
}
