"use client";

import { useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export function PushNotificationManager() {
    const { data: session } = useSession();

    const saveSubscription = useCallback(async (subscription: PushSubscription) => {
        await fetch("/api/notifications/subscribe", {
            method: "POST",
            body: JSON.stringify(subscription),
            headers: {
                "Content-Type": "application/json",
            },
        });
    }, []);

    const registerServiceWorker = useCallback(async () => {
        try {
            const registration = await navigator.serviceWorker.register("/sw.js");
            console.log("Service Worker registered");

            // We only subscribe if we have the public key
            const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!publicVapidKey) return;

            const subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                const newSubscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
                });

                await saveSubscription(newSubscription);
            } else {
                // Even if subscribed, we send to backend to ensure userId is updated
                await saveSubscription(subscription);
            }
        } catch (error) {
            console.error("SW Registration failed:", error);
        }
    }, [saveSubscription]);

    useEffect(() => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            registerServiceWorker();
        }
    }, [session, registerServiceWorker]);

    return null; // This component doesn't render anything
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
