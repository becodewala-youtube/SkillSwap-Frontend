import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Phone } from 'lucide-react';
import Button from './Button';

interface WebRTCCallProps {
  isOpen: boolean;
  callType: 'audio' | 'video';
  otherUser: {
    name: string;
    avatar?: string;
  };
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  isMuted: boolean;
  isVideoOff: boolean;
  localStream?: MediaStream;
  remoteStream?: MediaStream;
}

const WebRTCCall: React.FC<WebRTCCallProps> = ({
  isOpen,
  callType,
  otherUser,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  isMuted,
  isVideoOff,
  localStream,
  remoteStream
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-50 flex items-center justify-center"
    >
      <div className="max-w-4xl w-full mx-auto p-6">
        {callType === 'video' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Remote video */}
            <div className="relative bg-slate-800 rounded-xl overflow-hidden aspect-video">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-2 py-1 rounded">
                {otherUser.name}
              </div>
            </div>
            
            {/* Local video */}
            <div className="relative bg-slate-800 rounded-xl overflow-hidden aspect-video">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-2 py-1 rounded">
                You
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center mb-8">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              {otherUser.avatar ? (
                <img
                  src={otherUser.avatar}
                  alt={otherUser.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-3xl">
                  {otherUser.name.charAt(0)}
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{otherUser.name}</h3>
            <p className="text-slate-400">Audio Call</p>
          </div>
        )}

        {/* Call controls */}
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={onToggleMute}
            className={`${isMuted ? 'bg-red-500/20 border-red-500' : 'border-slate-600'}`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          
          {callType === 'video' && (
            <Button
              variant="outline"
              onClick={onToggleVideo}
              className={`${isVideoOff ? 'bg-red-500/20 border-red-500' : 'border-slate-600'}`}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </Button>
          )}
          
          <Button
            variant="danger"
            onClick={onEndCall}
            className="bg-red-500 hover:bg-red-600 px-8 py-3"
          >
            <PhoneOff className="w-5 h-5 mr-2" />
            End Call
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default WebRTCCall;