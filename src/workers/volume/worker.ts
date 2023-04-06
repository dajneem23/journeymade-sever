import { expose } from 'threads/worker';
import { volumeCounter } from './counter'

expose(volumeCounter);