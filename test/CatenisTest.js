/**
 * Created by claudio on 2022-12-26
 */
import {
    CatenisApiClient,
    CatenisApiError
} from '../main.js';
import { expect } from 'chai';
import { suite } from './suite/CatenisTestSuite.js';

suite({
    CatenisApiClient,
    CatenisApiError
}, expect);
