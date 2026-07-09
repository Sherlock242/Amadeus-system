"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface DivergenceMeterProps {
    isGlitching: boolean;
}

const DivergenceMeter: React.FC<DivergenceMeterProps> = ({ isGlitching }) => {
    const [divergence, setDivergence] = useState('1.048596');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const generateNewDivergence = () => {
        const base = 1.048596;
        const randomOffset = (Math.random() - 0.5) * 0.0001;
        return (base + randomOffset).toFixed(6);
    };

    useEffect(() => {
        if (isGlitching) {
            intervalRef.current = setInterval(() => {
                const randomDiv = `${Math.floor(Math.random() * 2)}.${Math.random().toString().substring(2, 8)}`;
                setDivergence(randomDiv);
            }, 50);
        } else {
            setDivergence('1.048596');
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isGlitching]);

    return (
        <div className="text-center">
            <span className="text-amber-500/80 uppercase font-orbitron tracking-[0.3em] text-[10px] font-bold">World Line Divergence</span>
            <div className="font-roboto-mono text-3xl tracking-[0.15em] mt-1 flex justify-center items-center" style={{ color: '#fbbf24', textShadow: '0 0 15px rgba(251,191,36,0.8)' }}>
                {divergence}
            </div>
        </div>
    );
};

export default DivergenceMeter;
