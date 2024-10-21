'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LuLock } from 'react-icons/lu';
import { Link } from 'react-router-dom';

import { Button, Card } from '@/components/common';
import Logo from '@/components/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Card className="w-full max-w-md bg-white bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-xl shadow-secondary/20 space-y-8">
          <div className="text-center">
            <div className="text-secondary-500 flex flex-col items-center justify-center gap-2">
              <Logo variant="secondary" className="w-16 opacity-10" />
              <div className="flex flex-col">
                <span className="font-light text-xl">
                  Sabemos dónde estacionar
                </span>
                <span className="text-lg">pero no tu contraseña</span>
              </div>
            </div>
          </div>
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-gray-700">
                  Correo
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="email@parkify.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-gray-700">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <Link to="/map">
                  <Button
                    type="submit"
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300 flex items-center justify-center"
                  >
                    <LuLock className="w-4 h-4 mr-2" />
                    Inicia Sesión
                  </Button>
                </Link>
              </div>
            </form>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              No tienes cuenta aún?{' '}
            </p>
          </div>
        </Card>
      </motion.div>
      <motion.div
        className="absolute top-10 left-10 w-20 h-20 bg-sky-300 rounded-full opacity-50"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-32 h-32 bg-gray-300 rounded-full opacity-50"
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
    </div>
  );
}
