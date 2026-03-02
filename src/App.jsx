import React, { useState, useRef, useCallback, useEffect } from 'react';
import HomeScreen from './screens/HomeScreen.jsx';
import QuizEditorScreen from './screens/QuizEditorScreen.jsx';
import HostLobbyScreen from './screens/HostLobbyScreen.jsx';
import HostGameScreen from './screens/HostGameScreen.jsx';
import JoinScreen from './screens/JoinScreen.jsx';
import PlayerGameScreen from './screens/PlayerGameScreen.jsx';
import { LanguageProvider } from './i18n.jsx';
import { ThemeProvider } from './ThemeProvider.jsx';

/**
 * App — SPA router based on state
 *
 * Screens:
 *  home           → create/join
 *  editor         → quiz editor
 *  host-lobby     → waiting for players
 *  host-game      → host running the game
 *  join           → player enters code + name
 *  player-game    → player answering questions
 */
export default function App() {
    const [screen, setScreen] = useState(() => {
        const urlParams = new URL(window.location.href).searchParams;
        return urlParams.get('code') ? 'join' : 'home';
    });
    const [screenProps, setScreenProps] = useState({});

    const navigate = useCallback((newScreen, props = {}) => {
        setScreen(newScreen);
        setScreenProps(props);
    }, []);

    return (
        <ThemeProvider>
            <LanguageProvider>
                <div className="bg-gradient" />
                {screen === 'home' && (
                    <HomeScreen navigate={navigate} />
                )}
                {screen === 'editor' && (
                    <QuizEditorScreen navigate={navigate} quizId={screenProps.quizId} />
                )}
                {screen === 'host-lobby' && (
                    <HostLobbyScreen navigate={navigate} quizId={screenProps.quizId} />
                )}
                {screen === 'host-game' && (
                    <HostGameScreen
                        navigate={navigate}
                        quiz={screenProps.quiz}
                        hostConnection={screenProps.hostConnection}
                        gameEngine={screenProps.gameEngine}
                    />
                )}
                {screen === 'join' && (
                    <JoinScreen navigate={navigate} />
                )}
                {screen === 'player-game' && (
                    <PlayerGameScreen
                        navigate={navigate}
                        playerConnection={screenProps.playerConnection}
                        playerName={screenProps.playerName}
                    />
                )}
            </LanguageProvider>
        </ThemeProvider>
    );
}
