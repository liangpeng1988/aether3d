import * as THREE from 'three';
// 分别从不同的模块导入实际的类和组件
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { SSRPass } from 'three/examples/jsm/postprocessing/SSRPass.js';

// 导入反射相关对象
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { ReflectorForSSRPass } from 'three/examples/jsm/objects/ReflectorForSSRPass.js';

// 导入模糊着色器
import { HorizontalBlurShader } from 'three/examples/jsm/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'three/examples/jsm/shaders/VerticalBlurShader.js';

// 导入CSS2DRenderer
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// 导入RectAreaLight相关组件
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import {RectAreaLightHelper} from "three/examples/jsm/helpers/RectAreaLightHelper.js";

// 导入OrbitControls
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import Stats from 'three/examples/jsm/libs/stats.module.js';

import * as TWEEN from '@tweenjs/tween.js'


// 导出 THREE 作为命名空间和其他组件
export {
  THREE,
  TWEEN,
  Stats,
  EffectComposer,
  RenderPass,
  ShaderPass,
  OutputPass,
  UnrealBloomPass,
  OutlinePass,
  SSRPass,
  Reflector,
  ReflectorForSSRPass,
  HorizontalBlurShader,
  VerticalBlurShader,
  CSS2DRenderer,
  CSS2DObject,
  RectAreaLightUniformsLib,
  RectAreaLightHelper,
  OrbitControls
};