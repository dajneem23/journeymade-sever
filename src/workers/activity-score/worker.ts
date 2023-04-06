import { expose } from 'threads/worker';
import { activityScoreCounter } from './counter'

expose(activityScoreCounter);