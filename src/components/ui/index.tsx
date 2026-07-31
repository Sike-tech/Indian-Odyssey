import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LinearGradient } from 'expo-linear-gradient';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
  gradient?: boolean;
}

export function Card({ className, children, gradient = false, ...props }: CardProps) {
  return (
    <View
      className={cn(
        'rounded-3xl overflow-hidden border border-royal/20 shadow-card',
        gradient
          ? 'bg-gradient-to-br from-midnight-400/90 to-midnight-600/95'
          : 'bg-midnight-500/85',
        className
      )}
      style={{
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
      }}
      {...props}
    >
      <LinearGradient
        colors={gradient ? ['rgba(212,175,55,0.10)', 'rgba(8,27,58,0.02)'] : ['rgba(255,255,255,0.04)', 'rgba(0,0,0,0.06)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1"
      >
        <View className="absolute inset-0 rounded-3xl border border-white/5" pointerEvents="none" />
        {children}
      </LinearGradient>
    </View>
  );
}

interface GoldButtonProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function GoldButton({
  title,
  subtitle,
  onPress,
  disabled = false,
  className,
  variant = 'primary',
}: GoldButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      className={cn(
        'rounded-[28px] overflow-hidden shadow-gold-md',
        disabled && 'opacity-50',
        className
      )}
      style={{
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 18,
        elevation: 10,
      }}
    >
      <LinearGradient
        colors={
          isPrimary
            ? ['#F8EFD4', '#E6C36A', '#D4AF37', '#B5942A']
            : variant === 'secondary'
            ? ['#0F2444', '#0B1E3A', '#08152B']
            : ['rgba(15,36,68,0.6)', 'rgba(8,21,58,0.8)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className={cn(
          'px-6 py-4 items-center justify-center border',
          isPrimary ? 'border-royal-200/60' : variant === 'secondary' ? 'border-royal/25' : 'border-royal/30'
        )}
      >
        <View className="absolute inset-x-0 top-0 h-px bg-white/20" />
        <Text
          className={cn(
            'text-base font-bold tracking-[2px]',
            isPrimary ? 'text-midnight-900' : 'text-royal-100'
          )}
          style={isPrimary ? { textShadowColor: 'rgba(212,175,55,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 } : undefined}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            className={cn(
              'text-xs mt-1 tracking-wide',
              isPrimary ? 'text-midnight-700' : 'text-royal-300/80'
            )}
          >
            {subtitle}
          </Text>
        ) : null}
      </LinearGradient>
    </TouchableOpacity>
  );
}

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  height?: number;
}

export function ProgressBar({ value, max, className, height = 6 }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <View
      className={cn('w-full rounded-full overflow-hidden border border-white/8 bg-midnight-800/80', className)}
      style={{ height }}
    >
      <View
        className="h-full rounded-full overflow-hidden"
        style={{ width: `${pct}%` }}
      >
        <LinearGradient
          colors={['#F8EFD4', '#E6C36A', '#D4AF37']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-1"
        />
      </View>
    </View>
  );
}

interface LuxuryCardProps {
  children: React.ReactNode;
  className?: string;
}

export function LuxuryCard({ children, className }: LuxuryCardProps) {
  return (
    <Card className={cn('border border-royal/15 rounded-[24px] shadow-card', className)}>
      {children}
    </Card>
  );
}
