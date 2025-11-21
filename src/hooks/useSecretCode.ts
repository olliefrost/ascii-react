import { useEffect, useState } from 'react';

const SECRET_CODE = 'frost frost frost';

export const useSecretCode = () => {
    const [triggered, setTriggered] = useState(false);
    const [inputBuffer, setInputBuffer] = useState('');

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const { key } = event;

            // We only care about single character keys to keep it simple
            if (key.length === 1) {
                setInputBuffer((prev) => {
                    const newBuffer = prev + key;
                    // Keep buffer only as long as the secret code to avoid memory issues
                    // but we need to be careful about partial matches if we were doing something more complex.
                    // For exact suffix match, keeping a bit more context is fine, or just slicing.
                    // Let's slice to keep it manageable, say 2x length just in case.
                    if (newBuffer.length > SECRET_CODE.length * 2) {
                        return newBuffer.slice(-SECRET_CODE.length * 2);
                    }
                    return newBuffer;
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (inputBuffer.endsWith(SECRET_CODE)) {
            setTriggered(true);
            setInputBuffer(''); // Reset buffer after trigger
        }
    }, [inputBuffer]);

    const reset = () => {
        setTriggered(false);
        setInputBuffer('');
    };

    return { triggered, reset };
};
