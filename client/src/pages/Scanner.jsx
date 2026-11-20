import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from '../api';
import toast from 'react-hot-toast';

const Scanner = () => {
    const [status, setStatus] = useState("Initializing Camera...");
    const scannerRef = useRef(null);
    const isStarted = useRef(false); // Safety lock

    useEffect(() => {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const startScanner = async () => {
            if (isStarted.current) return; // Stop if already starting

            try {
                await html5QrCode.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    async (decodedText) => {
                        // Success Logic
                        setStatus("Verifying Ticket...");
                        try {
                            const res = await axios.post('/api/bookings/verify', { qrData: decodedText });
                            toast.success("✅ " + res.data.message);
                            setStatus("Ready to Scan");
                        } catch (err) {
                            toast.error("❌ " + (err.response?.data?.message || "Invalid QR"));
                        }
                    }
                );
                isStarted.current = true;
                setStatus("Ready to Scan");
            } catch (err) {
                console.error("Camera Start Error:", err);
                setStatus("Camera Error: Please Refresh");
            }
        };

        startScanner();

        // CLEANUP: The safe way
        return () => {
            if (scannerRef.current && isStarted.current) {
                scannerRef.current.stop()
                    .then(() => {
                        isStarted.current = false;
                        console.log("Scanner stopped.");
                    })
                    .catch(err => console.log("Stop ignored (not running)."));
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
            <h1 className="text-2xl font-black uppercase tracking-widest text-yellow-500 mb-2">
                Elite Scanner
            </h1>
            <p className="text-[10px] text-gray-500 mb-8 uppercase tracking-[0.3em] font-bold">
                {status}
            </p>

            <div className="relative w-full max-w-sm aspect-square bg-gray-900 rounded-[40px] border-2 border-gray-800 overflow-hidden shadow-2xl">
                <div id="reader" className="w-full h-full"></div>
                
                {/* The Visual Guide */}
                <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-yellow-500 rounded-3xl opacity-50 animate-pulse"></div>
            </div>

            <button 
                onClick={() => window.location.reload()}
                className="mt-12 px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full"
            >
                Refresh Scanner
            </button>
        </div>
    );
};

export default Scanner;