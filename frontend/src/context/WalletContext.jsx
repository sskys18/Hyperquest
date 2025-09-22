import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const WalletContext = createContext(null)

export function WalletProvider({ children }) {
  const [address, setAddress] = useState('')
  const [chainId, setChainId] = useState('')
  const hasProvider = typeof window !== 'undefined' && !!window.ethereum && typeof window.ethereum.request === 'function'

  useEffect(() => {
    if (!hasProvider) return
    let mounted = true
    ;(async () => {
      try {
        const [accs, cid] = await Promise.all([
          window.ethereum.request({ method: 'eth_accounts' }),
          window.ethereum.request({ method: 'eth_chainId' })
        ])
        if (!mounted) return
        setAddress(accs?.[0] || '')
        setChainId(cid || '')
      } catch (_) {}
    })()

    function onAccountsChanged(accs) {
      setAddress(accs?.[0] || '')
    }
    function onChainChanged(cid) {
      setChainId(cid)
    }
    window.ethereum.on?.('accountsChanged', onAccountsChanged)
    window.ethereum.on?.('chainChanged', onChainChanged)
    return () => {
      mounted = false
      window.ethereum.removeListener?.('accountsChanged', onAccountsChanged)
      window.ethereum.removeListener?.('chainChanged', onChainChanged)
    }
  }, [hasProvider])

  async function connect() {
    if (!hasProvider) return []
    const accs = await window.ethereum.request({ method: 'eth_requestAccounts' })
    setAddress(accs?.[0] || '')
    const cid = await window.ethereum.request({ method: 'eth_chainId' })
    setChainId(cid || '')
    return accs
  }

  function disconnect() {
    // Most wallets don't support programmatic disconnect; just clear local state
    setAddress('')
  }

  const value = useMemo(() => ({ address, chainId, hasProvider, connect, disconnect }), [address, chainId, hasProvider])
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}

