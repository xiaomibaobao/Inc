import Config from './config';
import Hook from './hook';
import Merge from './merge';

class Inc {
    constructor () {
        this.config = new Config();
        this.hook = new Hook();

        this.merge = new Merge(this.config, this.hook);
    }
}

export default new Inc();
