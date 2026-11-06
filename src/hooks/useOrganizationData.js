// src/hooks/useOrganizationData.js
import { useState, useEffect } from 'react';
import { fetchDataForPrerender, isPrerender } from '../utils/1prerender';
import { db } from '../firebase';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';

export function useOrganizationData(collectionName, options = {}) {
    const {
        realtime = false,
        initialData = null,
        enabled = true
    } = options;

    const [data, setData] = useState(initialData || []);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        // If we have data already (from prerender), use it
        if (data && data.length > 0 && !realtime) {
            setLoading(false);
            return;
        }

        // If in prerender, use the static data
        if (isPrerender && data && data.length > 0) {
            setLoading(false);
            return;
        }

        let unsubscribe = null;
        let isMounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);

                // Try to get from prerender cache first
                const cachedData = await fetchDataForPrerender(collectionName);
                if (cachedData && cachedData.length > 0 && isMounted) {
                    setData(cachedData);
                    setLoading(false);
                    return;
                }

                // If realtime, set up listener
                if (realtime) {
                    const q = collection(db, collectionName);
                    unsubscribe = onSnapshot(q, (querySnapshot) => {
                        if (!isMounted) return;
                        const items = [];
                        querySnapshot.forEach((doc) => {
                            items.push({ id: doc.id, ...doc.data() });
                        });
                        setData(items);
                        setLoading(false);
                        setError(null);
                    }, (err) => {
                        if (!isMounted) return;
                        console.error('Firebase realtime error:', err);
                        setError(err);
                        setLoading(false);
                    });
                    return;
                }

                // One-time fetch
                const querySnapshot = await getDocs(collection(db, collectionName));
                const items = [];
                querySnapshot.forEach((doc) => {
                    items.push({ id: doc.id, ...doc.data() });
                });

                if (isMounted) {
                    setData(items);
                    setLoading(false);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Error fetching data:', err);
                    setError(err);
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [collectionName, realtime, enabled]);

    return { data, loading, error, setData };
}