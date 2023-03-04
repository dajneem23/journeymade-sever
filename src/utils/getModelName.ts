import config from '@/config';

export function getModelName(name: string): string {
  if (config.nodeEnv === 'development') {
    return `${name}-dev`;
  }

  return name;
}
