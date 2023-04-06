import { ActivityScoreCounterType, BehaviorCounterType, VolumeCounterType } from '@/workers';
import { Worker, spawn } from "threads";
import Container, { Token } from 'typedi';
import logger from './logger';

export const behaviorCounterToken = new Token<any>('_behaviorCounter');
export const volumeCounterToken = new Token<any>('_volumeCounter');
export const activityScoreCounterToken = new Token<any>('_activityScoreCounter');

export default async function workerLoader() {
  const [behaviorWorker, volumeWorker, activityScoreWorker] = await Promise.all([
    spawn<BehaviorCounterType>(new Worker("../workers/behavior/worker")),
    spawn<VolumeCounterType>(new Worker("../workers/volume/worker")),
    spawn<ActivityScoreCounterType>(new Worker("../workers/activity-score/worker"))
  ]);

  Container.set(behaviorCounterToken, behaviorWorker);
  Container.set(volumeCounterToken, volumeWorker);
  Container.set(activityScoreCounterToken, activityScoreWorker);

  if (behaviorWorker && volumeWorker && activityScoreWorker) {
    logger.info('loaded workers!');
  }
 
  return {
    behaviorWorker,
    volumeWorker,
    activityScoreWorker,
  };
}

// https://api.telegram.org/bot6228049691:AAEW_8Lm2hAXnz-WpGymi6tLOuCTJLwPoNo/getUpdates
