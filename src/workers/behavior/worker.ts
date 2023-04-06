import { expose } from 'threads/worker';
import { behaviorCounter } from './counter'

expose(behaviorCounter);