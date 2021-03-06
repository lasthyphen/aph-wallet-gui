<template>
  <section id="dex--marketselection">
    <div class="header">
        <h1 class="underlined">{{ $t('marketPairs') }}</h1>
    </div>
    <div class="selection">
      <market-mega-selector></market-mega-selector>
    </div>
    <aph-spinner-wrapper size="small" identifier="fetchTradeHistory">
      <div class="market">
        <div class="day-values">
          <div class="row">
            <div class="label">{{$t('vol')}}</div>
            <div class="value">
              <div>{{ $formatMoney(tickerData.baseVolume * baseCurrencyUnitPrice) }}</div>
              <div class="quote-volume">{{ $abbreviateNumber(tickerData.baseVolume) }} ({{ storeStateCurrentMarket.baseCurrency }})</div>
              <div class="quote-volume">{{ $abbreviateNumber(tickerData.quoteVolume) }} ({{ storeStateCurrentMarket.quoteCurrency }})</div>
            </div>
          </div>
          <div class="row">
            <div class="label">{{$t('OPEN')}}</div>
            <div class="value">{{ $formatTokenAmount(tickerData.open24hr) }}</div>
          </div>
          <div class="row">
            <div class="label">{{$t('HIGH')}}</div>
            <div class="value">{{ $formatTokenAmount(tickerData.high24hr) }}</div>
          </div>
          <div class="row">
            <div class="label">{{$t('LOW')}}</div>
            <div class="value">{{ $formatTokenAmount(tickerData.low24hr) }}</div>
          </div>
        </div>
        <div class="token-details">
          <aph-token-icon v-if="$store.state.currentMarket && $store.state.currentMarket.quoteCurrency" :symbol="$store.state.currentMarket.quoteCurrency"></aph-token-icon>
          <div class="base-price">
            {{ $formatTokenAmount(close24Hour) }}
          </div>
          <div class="base-price-converted">
            {{ $formatMoney(basePriceConverted) }}
          </div>
          <span class="label">{{ $t('change24H') }} ({{ $store.state.currentMarket ? $store.state.currentMarket.quoteCurrency : '' }})</span>
          <div :class="['change', {decrease: change24Hour < 0, increase: change24Hour > 0 }]">
            {{ $formatNumber(change24Hour) }}
            ({{ $formatNumber(percentChangeAbsolute) }}%)
          </div>
        </div>
      </div>
    </aph-spinner-wrapper>
  </section>
</template>

<script>
import { mapGetters } from 'vuex';
import { BigNumber } from 'bignumber.js';
import MarketMegaSelector from './MarketMegaSelector';

export default {
  components: {
    MarketMegaSelector,
  },

  computed: {
    basePriceConverted() {
      return this.close24Hour * this.baseCurrencyUnitPrice;
    },
    storeStateCurrentMarket() {
      return this.$store.state.currentMarket;
    },
    baseCurrencyUnitPrice() {
      return this.storeStateCurrentMarket && this.$store.state.holdings.length ?
        this.$services.neo.getHolding(this.storeStateCurrentMarket.baseAssetId).unitValue : 0;
    },
    close24Hour() {
      return this.$store.state.tradeHistory &&
        this.$store.state.tradeHistory.trades &&
        this.$store.state.tradeHistory.trades.length ?
        this.$store.state.tradeHistory.trades[0].price : 0;
    },
    percentChangeAbsolute() {
      return Math.round(((this.change24Hour)
        / this.tickerData.open24hr) * 10000) / 100;
    },
    change24Hour() {
      if (this.$isPending('fetchTradeHistory') &&
        !_.get(this.$store.state.requests, 'fetchTradeHistory').isSilent) {
        return 0;
      }

      return new BigNumber(String(this.close24Hour))
        .minus(new BigNumber(String(this.tickerData.open24hr)));
    },
    ...mapGetters([
      'tickerData',
    ]),
  },
};
</script>

<style lang="scss">
#dex--marketselection {
  .header {
    @extend %tile-light;

    flex: none;
    padding: $space $space 0;

    h1.underlined {
      @extend %underlined-header-sm;

      margin-bottom: 0;
    }
  }

  .selection {
    margin-bottom: $space;
  }

  .market {
    @extend %tile-light;

    padding: $space;
    display: flex;
    flex-direction: row;

    .day-values {
      display: flex;
      flex-direction: column;
      flex: 1;
      justify-content: flex-end;
    }

    .token-details {
      flex: none;
    }

    .row {
      display: flex;
      flex-direction: row;

      .label {
        @extend %small-uppercase-grey-label-dark;
        flex: 2;
      }

      .value {
        flex: 3;
        font-family: ProximaSemibold;
        font-size: toRem(12px);
        white-space: nowrap;
      }

      &.row,
      .quote-volume {
        margin-top: $space-sm;
      }
    }

    .token-details {
      align-items: flex-end;
      display: flex;
      flex-direction: column;

      > *:nth-child(n + 2) {
        margin-top: $space-sm;
      }

      .market-name {
        font-family: ProximaSemibold;
        margin-top: $space;
      }

      .label {
        @extend %small-uppercase-grey-label-dark;
      }

      .base-price {
        font-family: ProximaSemibold;
        font-size: toRem(16px);
      }

      .base-price-converted {
        font-family: ProximaSemibold;
        font-size: toRem(12px);
      }

      .change {
        font-size: toRem(12px);

        &.increase {
          color: $green;

          &:before {
            content: "+";
          }
        }

        &.decrease {
          color: $red;
        }
      }
    }
  }
}
</style>
