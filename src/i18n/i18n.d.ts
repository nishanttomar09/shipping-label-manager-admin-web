import 'i18next';

import type common from './locales/en/common.json';
import type login from './locales/en/login.json';
import type users from './locales/en/users.json';
import type auditLogs from './locales/en/auditLogs.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      login: typeof login;
      users: typeof users;
      auditLogs: typeof auditLogs;
    };
  }
}
