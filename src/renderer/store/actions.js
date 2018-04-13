/* eslint-disable no-use-before-define */
import moment from 'moment';
import lockr from 'lockr';
import { alerts, neo, tokens, wallets } from '../services';
import { timeouts } from '../constants';
import router from '../router';
import network from '../services/network';

export {
  addToken,
  changeWallet,
  claimGas,
  createWallet,
  deleteWallet,
  fetchHoldings,
  fetchLatestWalletVersion,
  fetchPortfolio,
  fetchRecentTransactions,
  findTransactions,
  importWallet,
  openEncryptedKey,
  openPrivateKey,
  openSavedWallet,
};

function addToken({ dispatch }, { assetId, done, isCustom, symbol }) {
  tokens.add({
    symbol,
    assetId: assetId.replace('0x', ''),
    isCustom,
    network: network.getSelectedNetwork().net,
  });

  dispatch('fetchHoldings');

  done();
}

function changeWallet({ dispatch }, wallet) {
  wallets.setCurrentWallet(wallet).sync();
  dispatch('fetchHoldings');
  dispatch('fetchPortfolio');
  dispatch('fetchRecentTransactions');
}

function claimGas({ commit }) {
  const currentWallet = wallets.getCurrentWallet();

  if (!currentWallet) {
    return;
  }

  commit('startRequest', { identifier: 'claimGas' });

  setTimeout(() => {
    neo.claimGas()
      .then(() => {
        commit('endRequest', { identifier: 'claimGas' });
      })
      .catch((message) => {
        alerts.exception(message);
        commit('failRequest', { identifier: 'claimGas', message });
      });
  }, timeouts.NEO_API_CALL);
}

function createWallet({ commit }, { name, passphrase, passphraseConfirm }) {
  commit('startRequest', { identifier: 'createWallet' });

  setTimeout(() => {
    neo
      .createWallet(name, passphrase, passphraseConfirm)
      .then((walletName) => {
        router.push({
          path: '/login/wallet-created',
          query: { walletName },
        });
        commit('endRequest', { identifier: 'createWallet' });
      })
      .catch((message) => {
        commit('failRequest', { identifier: 'createWallet', message });
      });
  }, timeouts.NEO_API_CALL);
}

function fetchHoldings({ state, commit }) {
  const currentWallet = wallets.getCurrentWallet();

  if (!currentWallet) {
    return;
  }

  commit('startRequest', { identifier: 'fetchHoldings' });

  const holdingsStorageKey = `aph.holdings.${currentWallet.address}.${state.currentNetwork.net}`;
  const localHoldings = lockr.get(holdingsStorageKey);
  if (localHoldings) {
    state.holdings = localHoldings;

    if (!state.statsToken && state.holdings.length) {
      state.statsToken = state.holdings[0];
    }
  }

  neo
    .fetchHoldings(currentWallet.address)
    .then((data) => {
      commit('setHoldings', data.holdings);
      commit('endRequest', { identifier: 'fetchHoldings' });
    })
    .catch((message) => {
      alerts.exception(message);
      commit('failRequest', { identifier: 'fetchHoldings', message });
    });
}

function fetchPortfolio({ state, commit }) {
  const currentWallet = wallets.getCurrentWallet();

  if (!currentWallet) {
    return;
  }

  commit('startRequest', { identifier: 'fetchPortfolio' });

  const portfolioStorageKey = `aph.portfolio.${currentWallet.address}.${state.currentNetwork.net}`;
  const localPortfolio = lockr.get(portfolioStorageKey);
  if (localPortfolio) {
    state.portfolio = localPortfolio;
  }

  neo
    .fetchHoldings(currentWallet.address)
    .then((data) => {
      commit('setPortfolio', {
        balance: data.totalBalance,
        changePercent: data.change24hrPercent,
        changeValue: data.change24hrValue.toFixed(2),
      });
      commit('endRequest', { identifier: 'fetchPortfolio' });
    })
    .catch((e) => {
      commit('failRequest', { identifier: 'fetchPortfolio', message: e });
    });
}

function fetchRecentTransactions({ state, commit }) {
  const currentWallet = wallets.getCurrentWallet();

  if (!currentWallet) {
    return;
  }

  commit('startRequest', { identifier: 'fetchRecentTransactions' });

  const transactionsStorageKey = `aph.transactions.${currentWallet.address}.${state.currentNetwork.net}`;
  const localTransactions = lockr.get(transactionsStorageKey);

  let lastBlockIndex = 0;
  if (localTransactions && localTransactions.length > 0) {
    lastBlockIndex = localTransactions[0].block_index;
    state.recentTransactions = localTransactions;
  }

  neo
    .fetchRecentTransactions(currentWallet.address, false,
      moment().subtract(30, 'days'), null, lastBlockIndex, null)
    .then((data) => {
      commit('setRecentTransactions', data);
      commit('endRequest', { identifier: 'fetchRecentTransactions' });
    })
    .catch((message) => {
      alerts.exception(message);
      commit('failRequest', { identifier: 'fetchRecentTransactions', message });
    });
}

function findTransactions({ state, commit }) {
  const currentWallet = wallets.getCurrentWallet();

  if (!currentWallet) {
    return;
  }

  commit('startRequest', { identifier: 'findTransactions' });

  neo
    .fetchRecentTransactions(currentWallet.address, true,
      state.searchTransactionFromDate,
      state.searchTransactionToDate ? moment(state.searchTransactionToDate).add(1, 'days') : null)
    .then((data) => {
      commit('setSearchTransactions', data);
      commit('endRequest', { identifier: 'findTransactions' });
    })
    .catch((message) => {
      console.log(message);
      commit('failRequest', { identifier: 'findTransactions', message });
    });
}

function openEncryptedKey({ commit }, { encryptedKey, passphrase, done }) {
  commit('startRequest', { identifier: 'openEncryptedKey' });

  setTimeout(() => {
    wallets.openEncryptedKey(encryptedKey, passphrase)
      .then(() => {
        done();
        commit('endRequest', { identifier: 'openEncryptedKey' });
      })
      .catch((e) => {
        commit('failRequest', { identifier: 'openEncryptedKey', message: e.message });
      });
  }, timeouts.NEO_API_CALL);
}

function openPrivateKey({ commit }, { wif, done }) {
  commit('startRequest', { identifier: 'openPrivateKey' });

  setTimeout(() => {
    wallets.openWIF(name, wif)
      .then(() => {
        done();
        commit('endRequest', { identifier: 'openPrivateKey' });
      })
      .catch((e) => {
        commit('failRequest', { identifier: 'openPrivateKey', message: e.message });
      });
  }, timeouts.NEO_API_CALL);
}

function openSavedWallet({ commit }, { name, passphrase, done }) {
  commit('startRequest', { identifier: 'openSavedWallet' });

  setTimeout(() => {
    wallets.openSavedWallet(name, passphrase)
      .then(() => {
        done();
        commit('endRequest', { identifier: 'openSavedWallet' });
      })
      .catch((e) => {
        commit('failRequest', { identifier: 'openSavedWallet', message: e.message });
      });
  }, timeouts.NEO_API_CALL);
}

function importWallet({ commit }, { name, wif, passphrase, done }) {
  commit('startRequest', { identifier: 'importWallet' });

  setTimeout(() => {
    wallets.importWIF(name, wif, passphrase)
      .then(() => {
        wallets.sync();
        done();
        commit('endRequest', { identifier: 'importWallet' });
      })
      .catch((e) => {
        alerts.exception(e);
        commit('failRequest', { identifier: 'importWallet', message: e.message });
      });
  }, timeouts.NEO_API_CALL);
}

function deleteWallet({ commit }, { name, done }) {
  commit('startRequest', { identifier: 'deleteWallet' });

  setTimeout(() => {
    wallets.remove(name)
      .then(() => {
        wallets.sync();
        done();
        commit('endRequest', { identifier: 'deleteWallet' });
      })
      .catch((e) => {
        alerts.exception(e);
        commit('failRequest', { identifier: 'deleteWallet', message: e.message });
      });
  }, timeouts.NEO_API_CALL);
}

function fetchLatestWalletVersion({ commit }, { done }) {
  commit('startRequest', { identifier: 'walletVersion' });
  setTimeout(() => {
    try {
      return axios.get(`${network.getSelectedNetwork().aph}/LatestWalletInfo`)
        .then((res) => {
          done(res.data);
          commit('endRequest', { identifier: 'walletVersion' });
        })
        .catch((e) => {
          console.log(e);
          commit('failRequest', { identifier: 'walletVersion', message: e });
        });
    } catch (e) {
      console.log(e);
      commit('failRequest', { identifier: 'walletVersion', message: e.message });
      return null;
    }
  }, timeouts.NEO_API_CALL);
}
