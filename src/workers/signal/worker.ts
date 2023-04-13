import { expose } from 'threads/worker';
import { signalCounter } from './counter'

expose(signalCounter);