import { useRef, useEffect } from 'react';

// bir sayfanın hala ekranda olup olmadığını döndüren şey

// https://gist.github.com/jaydenseric/a67cfb1b809b1b789daa17dfe6f83daa
// burdan aldık

export default function useIsMounted() {
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => isMounted.current = false;
    }, []);

    return isMounted;
}