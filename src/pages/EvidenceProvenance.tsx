import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import {
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Search,
  Copy,
  Info,
} from 'lucide-react';

export const EvidenceProvenance: React.FC = () => {
  const {
    events,
    verifyChainIntegrity,
    simulateTampering,
    restoreRecord,
    integrityResult,
    setSelectedPostForModal,
  } = useData();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  React.useEffect(() => {
    if (!integrityResult) {
      verifyChainIntegrity();
    }
  }, []);

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredEvidence = useMemo(() => {
    if (!searchQuery.trim()) return events.slice(0, 50);
    const q = searchQuery.toLowerCase();
    return events
      .filter(
        (e) =>
          e.id.toLowerCase().includes(q) ||
          e.authorId.toLowerCase().includes(q) ||
          e.evidenceHash.toLowerCase().includes(q) ||
          e.text.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [events, searchQuery]);

  const isChainValid = integrityResult?.isValid ?? true;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Cryptographic Evidence & Provenance Ledger
          </h2>
          <p className="text-xs text-slate-500">
            FIPS 180-4 SHA-256 hash-linked audit chain providing mathematical proof of post-ingest immutability
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => verifyChainIntegrity()}
            className="flex items-center gap-1.5 rounded bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-medium text-white transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Verify Chain Integrity</span>
          </button>

          <button
            onClick={() => simulateTampering()}
            className="flex items-center gap-1.5 rounded border border-rose-300 bg-white hover:bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition-colors"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Simulate Record Tampering</span>
          </button>

          <button
            onClick={() => restoreRecord()}
            className="flex items-center gap-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span>Restore Ledger</span>
          </button>
        </div>
      </div>

      {/* Verification Status Banner */}
      {integrityResult && (
        <div
          className={`rounded-lg border p-4 text-xs transition-all ${
            isChainValid
              ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
              : 'border-rose-200 bg-rose-50/80 text-rose-900'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {isChainValid ? (
                <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-rose-700 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="font-bold text-sm block">
                  {isChainValid
                    ? '100% Hash Chain Integrity Verified'
                    : 'INTEGRITY VIOLATION DETECTED: Tampered Record Identified'}
                </span>
                <p className="text-[11px] leading-relaxed font-mono">
                  {isChainValid
                    ? `Verified all ${integrityResult.totalRecords.toLocaleString()} records in ${integrityResult.elapsedMs}ms. All backward cryptographic hash pointers match canonical payloads.`
                    : `Tampered Record: ${integrityResult.tamperedRecordId} (Index #${integrityResult.tamperedIndex}). Hash mismatch detected at sequence link. Cryptographic proof broken.`}
                </p>
                {!isChainValid && integrityResult.computedHash && (
                  <div className="mt-2 text-[10px] font-mono bg-white p-2 rounded border border-rose-200 space-y-0.5">
                    <div>Expected Hash: {integrityResult.expectedHash}</div>
                    <div className="text-rose-700 font-bold">Calculated Hash: {integrityResult.computedHash}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-right text-[10px] font-mono opacity-75 shrink-0 hidden sm:block">
              <div>Checked at: {new Date(integrityResult.verifiedAt).toLocaleTimeString()}</div>
              <div>Elapsed: {integrityResult.elapsedMs} ms</div>
            </div>
          </div>
        </div>
      )}

      {/* Architecture & Non-Blockchain Explanation */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs space-y-2">
        <div className="flex items-center gap-2 text-slate-800 font-semibold">
          <Info className="h-4 w-4 text-slate-600" />
          <span>Cryptographic Architecture: Tamper-Evident Hash Chain</span>
        </div>
        <p className="text-slate-600 leading-relaxed text-[11px]">
          Each social event is cryptographically bound to its predecessor via recursive canonical hashing:{' '}
          <code className="text-slate-900 bg-white border border-slate-200 px-1 py-0.5 rounded font-mono">
            Hash(N) = SHA256(Hash(N-1) | ID | Timestamp | Platform | Author | Text | Topic | Sentiment)
          </code>
          . Any retroactive alteration to text, timestamp, or sentiment invalidates all subsequent hash links.
        </p>
        <p className="text-slate-500 text-[11px] italic">
          Disclaimer: This is a high-performance tamper-evident cryptographic hash chain, not a distributed blockchain.
          Hashing certifies that records have not been altered since initial ingestion; it does not claim to prove that
          the original author's social media statement was empirically true.
        </p>
      </div>

      {/* Evidence Ledger Table */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Audit Ledger Records ({events.length.toLocaleString()} Total)
            </h3>
            <p className="text-xs text-slate-500">
              Inspecting chronological chain sequence with previous hash pointers
            </p>
          </div>

          <div className="relative min-w-[260px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search event ID, author, hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 focus:bg-white focus:border-slate-400 focus:outline-none font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase text-slate-500 bg-slate-50">
                <th className="py-2 px-3 font-medium">Record ID</th>
                <th className="py-2 px-3 font-medium">Timestamp</th>
                <th className="py-2 px-3 font-medium">Platform</th>
                <th className="py-2 px-3 font-medium">Author</th>
                <th className="py-2 px-3 font-medium">Content Excerpt</th>
                <th className="py-2 px-3 font-medium">SHA-256 Hash</th>
                <th className="py-2 px-3 font-medium text-center">Status</th>
                <th className="py-2 px-3 font-medium text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvidence.map((ev) => (
                <tr
                  key={ev.id}
                  onClick={() => setSelectedPostForModal(ev)}
                  className={`cursor-pointer transition-colors ${
                    ev.tampered
                      ? 'bg-rose-50 hover:bg-rose-100/50'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{ev.id}</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                    {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{ev.platform}</td>
                  <td className="py-2.5 px-3 text-slate-700">{ev.authorId}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-800 max-w-xs truncate pr-2">
                    {ev.text}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-600 truncate max-w-[120px]">
                        {ev.evidenceHash.slice(0, 16)}...
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(ev.evidenceHash);
                        }}
                        className="p-0.5 text-slate-400 hover:text-slate-700"
                        title="Copy full hash"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                        ev.tampered
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {ev.tampered ? 'TAMPERED' : 'VERIFIED'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600 font-sans font-medium hover:text-slate-900">Details →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
