import { InitConfig } from '../../shared/config';
import { InitDrift } from './drifting';
import { InitEvents } from './events';
import { InitItems } from './items';
import { InitModes } from './modes';
import { InitTrialsMode } from './../controllers/modes/trials';

export async function Init(): Promise<void> {
    await InitConfig();
    await InitEvents();
    await InitDrift();
    await InitItems();
    await InitModes();
    await InitTrialsMode();
}