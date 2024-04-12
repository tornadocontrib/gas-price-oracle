import { BaseContract } from 'ethers';
import 'dotenv/config';
export interface gasstation {
    standard: {
        maxPriorityFee: number;
        maxFee: number;
    };
}
export interface Call3 {
    contract: BaseContract;
    name: string;
    params?: any[];
    allowFailure?: boolean;
}
