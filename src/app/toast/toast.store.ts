import { createStore } from '@zag-js/toast';

export const toaster = createStore({
    placement: 'bottom-end',
    overlap: true,
    duration: 10000000
});
