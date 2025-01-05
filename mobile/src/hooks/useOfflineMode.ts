import { useState, useEffect } from 'react';
import { OfflineStorage } from '../services/OfflineStorage';
import { SyncManager } from '../services/SyncManager';
import NetInfo from '@react-native-community/netinfo';

export function useOfflineMode() {
    const [isOnline, setIsOnline] = useState(true);
    const [syncStatus, setSyncStatus] = useState({});
    const [pendingChanges, setPendingChanges] = useState(0);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOnline(state.isConnected && state.isInternetReachable);
        });

        const syncManager = SyncManager.getInstance();
        const updateStatus = async () => {
            const status = await syncManager.getSyncStatus();
            setSyncStatus(status);
            setPendingChanges(status.pendingChanges);
        };

        updateStatus();
        const interval = setInterval(updateStatus, 30000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    const storage = OfflineStorage.getInstance();

    return {
        isOnline,
        syncStatus,
        pendingChanges,
        storage,
        forceSync: async () => {
            const syncManager = SyncManager.getInstance();
            await syncManager.forceSync();
        }
    };
}