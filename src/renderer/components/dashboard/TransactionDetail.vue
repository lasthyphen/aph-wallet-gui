<template>
  <section id="dashboard--transaction-detail">
    <div class="header">
      <h2 class="underlined">{{$t('transaction')}}</h2>
    </div>
    <div class="body" v-if="$store.state.activeTransaction">
      <div class="section">
        <div class="row">
          <div class="column confirmed" v-if="this.$store.state.activeTransaction.confirmed">
            <aph-icon name="confirmed-big"></aph-icon>
            <div class="label">{{$t('confirmed')}}</div>
          </div>
          <div class="column unconfirmed" v-else>
            <aph-icon name="unconfirmed-big"></aph-icon>
            <div class="label">{{$t('unconfirmed')}}</div>
          </div>
        </div>
        <div class="row">
          <div class="column">
            <div class="label">{{$t('hash')}}</div>
            <div class="value truncate">{{ $store.state.activeTransaction.txid }}</div>
          </div>
        </div>
        <div class="row">
          <div class="column">
            <div class="label">{{$t('date')}}</div>
            <div class="value">{{ $formatDate($store.state.activeTransaction.blocktime) }}</div>
          </div>
          <div class="column">
            <div class="label">{{$t('time')}}</div>
            <div class="value">{{ $formatTime($store.state.activeTransaction.blocktime) }}</div>
          </div>
          <div class="column">
            <div class="label">{{$t('block')}}</div>
            <div class="value purple">{{ $formatNumber($store.state.activeTransaction.block) }}</div>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="row" v-if="!$store.state.activeTransaction.isBTCBased">
          <div class="column">
            <div class="label">{{$t('from')}}</div>
            <aph-simple-transactions :transactions="fromTransactions" :show-block-time="false"></aph-simple-transactions>
          </div>
        </div>
        <div class="row">
          <div class="column">
            <div class="label">{{$t('to')}}</div>
            <aph-simple-transactions :transactions="toTransactions" :show-block-time="false"></aph-simple-transactions>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="row">
          <div class="column" v-if="!$store.state.activeTransaction.isETHBased && !$store.state.activeTransaction.isBTCBased">
            <div class="label">{{$t('networkFee')}}</div>
            <div class="value">{{ $formatNumber($store.state.activeTransaction.net_fee) }} GAS</div>
          </div>
          <div class="column" v-if="$store.state.activeTransaction.isETHBased">
            <div class="label">{{$t('networkFee')}}</div>
            <div class="value">{{ $formatNumber($store.state.activeTransaction.net_fee) }} ETH</div>
          </div>
          <div class="column" v-if="$store.state.activeTransaction.isBTCBased">
            <div class="label">{{$t('networkFee')}}</div>
            <div class="value">{{ $formatNumber($store.state.activeTransaction.net_fee) }} BTC</div>
          </div>
          <div class="column" v-if="!$store.state.activeTransaction.isETHBased && !$store.state.activeTransaction.isBTCBased">
            <div class="label">{{$t('systemFee')}}</div>
            <div class="value">{{ $formatNumber($store.state.activeTransaction.sys_fee) }} GAS</div>
          </div>
          <div class="column" v-if="!$store.state.activeTransaction.isETHBased">
            <div class="label">{{$t('Size')}}</div>
            <div class="value">{{ $formatNumber($store.state.activeTransaction.size) }} Bytes</div>
          </div>
        </div>
        <div class="row">
          <div class="column" v-if="this.$store.state.activeTransaction.confirmed">
            <div class="label">{{$t('confirmations')}}</div>
            <div class="value" v-if="!$store.state.activeTransaction.isETHBased &&
             !$store.state.activeTransaction.isBTCBased">{{ $formatNumber(confirmations) }}</div>
            <div class="value" v-if="$store.state.activeTransaction.isETHBased ||
             $store.state.activeTransaction.isBTCBased">{{ $formatNumber($store.state.activeTransaction.confirmations) }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  computed: {
    fromTransactions() {
      if (!this.$store.state.activeTransaction) {
        return [];
      }
      return this.$store.state.activeTransaction.vin;
    },

    toTransactions() {
      if (!this.$store.state.activeTransaction) {
        return [];
      }
      return this.$store.state.activeTransaction.vout;
    },

    btcFromTransactions() {
      if (!this.$store.state.activeTransaction) {
        return [];
      }
      return this.$store.state.activeTransaction.vinData;
    },

    btcToTransactions() {
      if (!this.$store.state.activeTransaction) {
        return [];
      }
      return this.$store.state.activeTransaction.voutData;
    },

    confirmations() {
      if (!this.$store.state.activeTransaction) {
        return 0;
      }
      return this.$store.state.currentNetwork.bestBlock.index - this.$store.state.activeTransaction.block;
    },
  },
};
</script>

<style lang="scss">
#dashboard--transaction-detail {
  @extend %tile-light;

  display: flex;
  flex-direction: column;
  padding-bottom: $space-lg;
  margin: $space;

  .header {
    position: relative;
    flex: none;
    padding: $space $space-lg;
    font-size: toRem(10px);
  }

  .body {
    overflow: auto;
    padding: 0 $space-lg;

    .transactions-table {
      td {
        border: none;
        padding: 0;

        &.amount {
          text-align: left;
        }
      }

      tr + tr {
        td {
          padding-top: $space-sm;
        }
      }
    }

    .section + .section {
      margin-top: $space-lg;
    }

    .row {
      display: flex;

      .column {
        flex: 1;

        .label {
          @extend %small-uppercase-grey-label;

          margin-bottom: $space-sm;
        }

        .value {
          font-family: ProximaSemibold;
          font-size: toRem(12px);

          &.purple {
            color: $purple;
          }

          &.red {
            color: $red;
          }

          &.truncate {
            @include truncate();
          }
        }

        & + .column {
          margin-left: $space-xl;
        }

        &.confirmed, &.unconfirmed {
          align-items: center;
          display: flex;
          padding-bottom: $space;

          .label {
            color: $green;
            margin: 0 0 0 $space-sm;
          }

          .aph-icon {
            svg {
              height: toRem(40px);

              .fill {
                fill: $green;
              }
            }
          }
        }

        &.unconfirmed {
          .label {
            color: $red;
          }

          .aph-icon {
            svg {
              .fill {
                fill: $red;
              }
            }
          }
        }
      }

      &.has-equal-columns {
        .column {
          flex: 1;
        }
      }

      & + .row {
        margin-top: $space;
      }
    }
  }
}
</style>
