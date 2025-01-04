import { useEffect, useRef, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { NotificationService } from '../services/NotificationService';

export function useNotifications() {
    const notificationListener = useRef<any>();
    const responseListener = useRef<any>();
    const navigation = useNavigation();

    const handleNotification = useCallback(async (notification: any) => {
        const { certificateId, domain } = notification.data;
        
        if (certificateId) {
            navigation.navigate('CertificateDetails', { id: certificateId });
        }
    }, [navigation]);

    useEffect(() => {
        const notificationService = NotificationService.getInstance();
        notificationService.registerForPushNotifications();

        notificationListener.current = Notifications.addNotificationReceivedListener(
            notification => {
                handleNotification(notification);
            }
        );

        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            response => {
                handleNotification(response.notification);
            }
        );

        return () => {
            Notifications.removeNotificationSubscription(notificationListener.current);
            Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, [handleNotification]);

    // Return notification functions...
}