import { db } from '../db/database'
import Automation from '../model/Automation'
import { RunAt } from '../enum/Automation';

export function save(instructions: string, runAt: RunAt, pattern?: string) {
    const automation: Automation = new Automation(instructions, runAt, pattern);

    return db.automations.put(automation);
}

export function selectOne(id: number) {
    return db.automations.get(id);
}

export function getAll() {
    return db.automations.toArray();
}

export function update(key, changes) {
    return db.automations.update(key, changes);
}

export function deleteAutomation(id: number) {
    return db.automations.delete(id);
}