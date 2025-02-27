import { createNormalizer, PropTypes } from '@zag-js/types';
import { isNumber, isObject, isString } from '@zag-js/utils';

const propMap: Record<string, string> = {
    onFocus: 'onfocusin',
    onBlur: 'onfocusout',
    onChange: 'oninput',
    onDoubleClick: 'ondblclick',
    defaultValue: 'value',
    defaultChecked: 'checked',
    htmlFor: 'for',
    className: 'class'
};

const preserveKeys = [
    'viewBox',
    'className',
    'preserveAspectRatio',
    'fillRule',
    'clipPath',
    'clipRule',
    'strokeWidth',
    'strokeLinecap',
    'strokeLinejoin',
    'strokeDasharray',
    'strokeDashoffset',
    'strokeMiterlimit'
];

export type StyleObject = Record<string, string>;

export type Dict = Record<string, boolean | number | string | EventListener | StyleObject | undefined>;

export const normalizeProps = createNormalizer<PropTypes<Dict>>(props => {
    const normalized: Dict = {};

    for (const [key, value] of Object.entries(props)) {
        if (key === 'style' && isString(value)) {
            if (isString(value)) {
                normalized['style'] = serializeStyle(value);
            } else if (isObject(value)) {
                normalized['style'] = hyphenateStyle(value);
            }

            continue;
        }

        if (key === 'children') {
            if (isString(value)) {
                normalized['textContent'] = value;
            }

            continue;
        }

        normalized[toAngularProp(key)] = value;
    }

    return normalized;
});

const STYLE_REGEX = /((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g;

function serializeStyle(style: string) {
    const res: StyleObject = {};

    let match: RegExpExecArray | null;

    while ((match = STYLE_REGEX.exec(style))) {
        res[match[1]] = match[2];
    }

    return res;
}

function hyphenateStyle(style: Record<string, string | number>): StyleObject {
    const res: StyleObject = {};

    for (const [property, value] of Object.entries(style)) {
        if (isString(value)) {
            res[hyphenateStyleName(property)] = value;
        } else if (isNumber(value)) {
            res[hyphenateStyleName(property)] = `${ value }px`;
        }
    }

    return res;
}

const cache = new Map<string, string>();
const uppercasePattern = /[A-Z]/g;
const msPattern = /^ms-/;

function hyphenateStyleName(name: string) {
    if (name.startsWith('--')) {
        return name;
    }

    if (cache.has(name)) {
        return cache.get(name)!;
    }

    const hName = name.replace(uppercasePattern, toHyphenLower);

    return cache.set(name, msPattern.test(hName) ? "-" + hName : hName).get(name)!;
}

function toHyphenLower(match: string) {
    return '-' + match.toLowerCase();
}

function toAngularProp(prop: string) {
    if (prop in propMap) {
        return propMap[prop];
    }

    if (preserveKeys.includes(prop)) {
        return prop;
    }

    return prop.toLowerCase();
}
