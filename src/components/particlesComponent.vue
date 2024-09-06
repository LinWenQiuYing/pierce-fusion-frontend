<template>
  <!-- 使用方法参见：https://www.npmjs.com/package/particles.vue3 -->
  <Particles
    id="tsparticles"
    :class="['particles-component', className]"
    :particlesInit="particlesInit"
    :options="options"
  />
</template>

<script lang="ts">
import { reactive } from "vue";

import type { Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";

export default {
  name: "ParticlesComponent",
  props: {
    className: {
      type: String,
      default: "",
    },
  },
  setup() {
    const particlesInit = async (engine: Engine) => {
      await loadSlim(engine);
    };

    // 使用方法参见：https://www.npmjs.com/package/particles.vue3
    const options = reactive({
      // 背景配置
      background: {
        color: {
          // value: "#000", // 粒子颜色
        },
      },
      // 每秒帧数限制
      fpsLimit: 60,
      // 交互配置
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push", // 可用的click模式有: "push", "remove", "repulse", "bubble"。
          },
          onHover: {
            enable: true,
            mode: "grab", // 可用的hover模式有: "grab", "repulse", "bubble"。
          },
          resize: true,
        },
        modes: {
          // 气泡模式
          bubble: {
            distance: 400,
            duration: 2,
            opacity: 0.8,
            size: 40,
          },
          // 推动模式
          push: {
            quantity: 4,
          },
          // 击退模式
          repulse: {
            distance: 200,
            duration: 0.4,
          },
        },
      },
      // 粒子配置
      particles: {
        color: {
          value: "#ffffff",
        },
        // 链接配置
        links: {
          color: "#ffffff", // '#dedede'。线条颜色。
          distance: 150, // 线条长度
          enable: true, // 是否有线条
          opacity: 0.4, // 线条透明度。
          width: 1, // 线条宽度。
        },
        // 碰撞配置
        collisions: {
          enable: false,
        },
        // 移动配置
        move: {
          direction: "none",
          enable: true,
          outMode: "bounce",
          random: false,
          speed: 0.5, // 粒子运动速度。
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: 100, // 粒子数量。
        },
        opacity: {
          value: 0.7, // 粒子透明度。
        },
        shape: {
          type: "circle", // 可用的粒子外观类型有："circle","edge","triangle", "polygon","star"
        },
        size: {
          random: true,
          value: 4,
        },
      },
      // 检测视网膜屏幕————当设置detectRetina为true时，插件会自动检测用户设备是否为视网膜屏幕（高清屏），
      // 并相应地调整粒子效果以适应高清屏幕的显示。这样可以确保粒子效果在不同类型的屏幕上都能呈现出最佳的效果，提升用户体验。
      detectRetina: false,
    });

    return {
      options,
      particlesInit,
    };
  },
};
</script>
<style lang="less" scoped></style>
