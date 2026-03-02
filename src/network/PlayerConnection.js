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
                    // Send join message
                    this.connection.send({
                        type: 'player-join',
                        payload: { name: playerName },
                    });
                    this.emit('connected', {});
                    resolve();
                });

                this.connection.on('data', (data) => {
                    this.emit('message', data);
                });

                this.connection.on('close', () => {
                    this.emit('disconnected', {});
                });

                this.connection.on('error', (err) => {
                    console.error('[Player] Connection error:', err);
                    this.emit('error', { error: err });
                    reject(err);
                });

                // Timeout for connection
                setTimeout(() => {
                    if (!this.connection.open) {
                        reject(new Error('Timeout conectando al host. Verifica el código de sala.'));
                    }
                }, 10000);
            });

            this.peer.on('error', (err) => {
                console.error('[Player] Peer error:', err);
                this.emit('error', { error: err });
                reject(err);
            });
        });
    }

    send(data) {
        if (this.connection && this.connection.open) {
            this.connection.send(data);
        }
    }

    destroy() {
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
