import { useEffect, useRef, useState, useCallback } from 'react';
import socketIOClient from 'socket.io-client';

const getServerUrl = () =>
  (process.env.REACT_APP_API_URL || 'http://localhost:3002').replace(/[\s;]+$/, '').trim() || 'http://localhost:3002';

export function useVideoCall(roomCode: string, sender: string, active: boolean) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<ReturnType<typeof socketIOClient> | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const endCall = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    pcRef.current?.close();
    pcRef.current = null;
    socketRef.current?.disconnect();
    socketRef.current = null;
    setStatus('idle');
  }, []);

  useEffect(() => {
    if (!active || !roomCode.trim() || !sender.trim()) return;

    const socket = socketIOClient(getServerUrl(), { transports: ['websocket'] });
    socketRef.current = socket;

    socket.emit('join_room', { room_code: roomCode.trim().toUpperCase(), room_name: '', sender });

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    pcRef.current = pc;

    pc.ontrack = (e) => {
      if (e.streams[0]) setRemoteStream(e.streams[0]);
    };

    let offered = false;
    socket.on('video_signal', async (data: { from?: string; type: string; sdp?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit }) => {
      if (data.from === socket.id) return;
      try {
        if (data.type === 'offer' && data.sdp) {
          offered = true;
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('video_signal', { type: 'answer', sdp: answer });
          setStatus('connected');
        } else if (data.type === 'answer' && data.sdp) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          setStatus('connected');
        } else if (data.type === 'ice' && data.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      } catch (err) {
        console.error('Video signal error:', err);
      }
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) socket.emit('video_signal', { type: 'ice', candidate: e.candidate });
    };

    (async () => {
      try {
        setStatus('connecting');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        setLocalStream(stream);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        setTimeout(async () => {
          if (offered) return;
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('video_signal', { type: 'offer', sdp: offer });
          } catch (e) {
            console.error('Create offer error:', e);
          }
        }, 1500);
      } catch (err) {
        console.error('Video call start error:', err);
        setStatus('idle');
        endCall();
      }
    })();

    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      pcRef.current?.close();
      pcRef.current = null;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [active, roomCode, sender, endCall]);

  return { localStream, remoteStream, status, endCall };
}
