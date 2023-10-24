
import { InitItems } from './items';
import { InitTrialsMode } from './../controllers/modes/trials';

export async function Init(): Promise<void> {
    await InitTrialsMode();
    await InitItems();
}