'use strict';

var hexo = hexo || {};
hexo.extend.filter.register('before_post_render', require('./lib/process'), 10);
