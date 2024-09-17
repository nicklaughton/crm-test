import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
@Injectable()
export class TranslateService {

	private projectId: string;

	private _currentLocale: string;

	public listLocales() {
		return [];
	}

	public getCurrentLocale(): string {
        return this._currentLocale;
    }

	public setCurrentLocale(locale: string) {
		this._currentLocale = locale;
	}

	public key(key, defaultText) {
	    key = key + '';
		return (this._currentLocale && this.keyMap[key] && this.keyMap[key][this._currentLocale]) ? this.keyMap[key][this._currentLocale] : defaultText;
	}

	private keyMap = {};

	constructor(){

	}
}