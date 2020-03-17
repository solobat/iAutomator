import * as automationService from '../service/automations.service';
import * as browser from 'webextension-polyfill';
import Response from '../common/response';
import * as Code from '../common/code';
import { IAutomation, db } from '../db/database';
import { RunAt } from '../enum/Automation';

export async function saveAutomation(recordId: number, runAt: RunAt = RunAt.END, pattern?: string): Promise<Response> {
    if (recordId) {
        const result: number = await automationService.save(recordId, runAt, pattern);

        return Response.ok(result);
    } else {
        return Response.error(Code.PARAMS_ERROR);
    }
}

export async function info(id: number): Promise<Response> {
    if (id) {
        const result = await automationService.selectOne(id);

        if (result) {
            return Response.ok(result);
        } else {
            return Response.error(Code.NOT_EXISTS);
        }
    } else {
        return Response.error(Code.PARAMS_ERROR);
    }
}

export async function updateAutomation(id: number, changes: object) {
    if (id) {
        const result = await automationService.update(id, changes);

        return Response.ok(result);
    } else {
        return Response.error(Code.PARAMS_ERROR);
    }
}

export async function getList() {
    const result = await automationService.getAll();

    return Response.ok(result);
}
