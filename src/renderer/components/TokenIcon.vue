<template>
  <div class="aph-token-icon">
    <img :src="imageUrl" v-if="symbolRequiresFetch" @load="imageLoadOnComplete" class="image-preloader"/>
    <img src="~@/assets/img/token-icons/APH.png" v-if="symbol === 'APH'">
    <img src="~@/assets/img/token-icons/GAS.png" v-else-if="symbol === 'GAS'">
    <img src="~@/assets/img/token-icons/NEO.png" v-else-if="symbol === 'NEO'">
    <img src="~@/assets/img/token-icons/BTC.png" v-else-if="symbol === 'BTC'">
    <img src="~@/assets/img/token-icons/ETH.png" v-else-if="symbol === 'ETH'">
    <img :src="imageUrl" v-else-if="useImage" />
    <div class="placeholder" v-else>
      <div class="placeholder-text">{{ symbol }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    symbol: {
      type: String,
    },
    isETHToken: {
      type: Boolean,
    },
    tokenIcon: {
      type: String,
    },
  },
  computed: {
    imageUrl() {
      if (this.isETHToken) {
        return this.tokenIcon;
      }
      return 'https://s3.us-east-2.amazonaws.com/aphelion-public-artifacts/TokenLogos/'
        + `${this.symbol.toLowerCase()}.png`;
    },
    symbolRequiresFetch() {
      return this.symbol !== 'APH'
        && this.symbol !== 'GAS'
        && this.symbol !== 'NEO'
        && this.symbol !== 'BTC'
        && this.symbol !== 'ETH';
    },
  },

  data() {
    return {
      useImage: false,
    };
  },

  methods: {
    imageLoadOnComplete() {
      this.useImage = true;
    },
  },
};
</script>


<style lang="scss">
.aph-token-icon {
  $iconSize: toRem(50px);

  font-size: 0;

  .image-preloader {
    display: none;
  }

  img, .placeholder {
    height: $iconSize;
    width: $iconSize;
    border-radius: 50%;
  }

  .placeholder {
    align-items: center;
    background: $grey;
    color: white;
    display: flex;
    font-size: 0;
    height: $iconSize;
    justify-content: center;

    > * {
      display: block;
      font-size: toRem(14px);
      position: relative;
      top: toRem(1px);
    }
  }
}
</style>
