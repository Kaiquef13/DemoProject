import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, AlertTriangle, RotateCcw, Play, ScanLine, Trash2, Server, Cpu, Activity, ChevronRight, ShieldAlert } from "lucide-react";
import bwipjs from "bwip-js";

const pad3 = (n) => n.toString().padStart(3, "0");

export default function SistemaMockup() {
  const [ls, setLs] = useState("");
  const [lu, setLu] = useState("");
  const [qty, setQty] = useState(300);
  const [seqStart, setSeqStart] = useState(1);
  const [loteAtivo, setLoteAtivo] = useState(false);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("AGUARDANDO SETUP");
  const [concOk, setConcOk] = useState(true);
  const [bocaDeLobo, setBocaDeLobo] = useState(false);
  const [produced, setProduced] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [seq, setSeq] = useState(1);
  const [subLoteMsg, setSubLoteMsg] = useState("");
  const [serverOnline, setServerOnline] = useState(true);
  const [forcarErro, setForcarErro] = useState(false);
  const [forcarDuplicidade, setForcarDuplicidade] = useState(false);
  const [speedFactor, setSpeedFactor] = useState(1.8);
  const [okCount, setOkCount] = useState(0);
  const [retrabalhoCount, setRetrabalhoCount] = useState(0);
  const [refugoCount, setRefugoCount] = useState(0);
  const hist = useRef([]);
  const [histRefresh, setHistRefresh] = useState(0);
  const corporateSeen = useRef(new Set());
  const localSeen = useRef(new Set());
  const [verifyOnSetup, setVerifyOnSetup] = useState(true);
  const [setupChecking, setSetupChecking] = useState(false);
  const [setupChecked, setSetupChecked] = useState(false);
  const [setupDupFound, setSetupDupFound] = useState(null);
  const [setupProgress, setSetupProgress] = useState(0);
  const codeAtual = useMemo(() => `${ls}${lu}${pad3(seq)}`, [ls, lu, seq]);
  const dmCanvasRef = useRef(null);

  useEffect(() => {
    if (!loteAtivo || !codeAtual || !dmCanvasRef.current) return;
    try {
      bwipjs.toCanvas(dmCanvasRef.current, { bcid: "datamatrix", text: codeAtual, scale: 4, padding: 8, backgroundcolor: "FFFFFF", includetext: false });
    } catch {}
  }, [loteAtivo, codeAtual, histRefresh]);

  useEffect(() => {
    console.assert(pad3(1) === "001", "pad3(1)");
    console.assert(pad3(12) === "012", "pad3(12)");
    console.assert(pad3(396) === "396", "pad3(396)");
    const wrap = ((396 >= 396 ? 1 : 397));
    console.assert(wrap === 1, "wrap 396→1");
    const n1 = parseInt("", 10);
    console.assert(Number.isNaN(n1), "parse empty to NaN baseline");
    console.assert(typeof bwipjs.toCanvas === "function", "bwipjs toCanvas");
  }, []);

  const resetExec = () => {
    setRunning(false);
    setStatus("PRONTO");
    setProduced(0);
    setRemaining(qty);
    setSeq(seqStart);
    setSubLoteMsg("");
  };

  const runSetupCheck = async () => {
    setSetupChecking(true);
    setSetupChecked(false);
    setSetupDupFound(null);
    setSetupProgress(0);
    const total = Math.min(qty, 9999);
    for (let i = 0; i < total; i++) {
      const s = ((seqStart - 1 + i) % 396) + 1;
      const code = `${ls}${lu}${pad3(s)}`;
      const dupLocal = localSeen.current.has(code);
      const dupCorp = serverOnline ? corporateSeen.current.has(code) : false;
      if (dupLocal || dupCorp) {
        setSetupDupFound({ seq: s, code });
        break;
      }
      if (i % 10 === 0) await delay(10 * speedFactor);
      setSetupProgress(Math.round(((i + 1) / total) * 100));
    }
    setSetupChecking(false);
    setSetupChecked(true);
  };

  const iniciarLote = async () => {
    if (!ls || !lu || qty <= 0 || seqStart < 1 || seqStart > 396) return;
    if (verifyOnSetup) {
      await runSetupCheck();
      if (setupDupFound) return;
    } else {
      setSetupChecked(false);
      setSetupDupFound(null);
      setSetupProgress(0);
    }
    setOkCount(0);
    setRetrabalhoCount(0);
    setRefugoCount(0);
    setLoteAtivo(true);
    resetExec();
  };

  const encerrarLote = () => {
    setRunning(false);
    setLoteAtivo(false);
    setStatus("LOTE ENCERRADO");
  };

  useEffect(() => {
    if (!loteAtivo || !running) return;
    let cancelled = false;
    const ciclo = async () => {
      if (remaining <= 0) {
        setStatus("LOTE CONCLUÍDO");
        setRunning(false);
        return;
      }
      setStatus("AGUARDANDO TESTE DE CONCENTRICIDADE");
      await delay(900 * speedFactor);
      if (!concOk) {
        setStatus("REFUGO: AGUARDANDO BOCA DE LOBO");
        await waitFor(() => bocaDeLobo || !running || cancelled, 180 * speedFactor);
        if (cancelled || !running) return;
        setBocaDeLobo(false);
        addHist({ code: codeAtual, seq, result: "REFUGO_CONCENTRICIDADE", details: "Refugo por concentricidade", ts: Date.now() });
        setRefugoCount((c)=>c+1);
        return;
      }
      setStatus("CHECANDO DUPLICIDADE");
      await delay(600 * speedFactor);
      const dupLocal = localSeen.current.has(codeAtual);
      const dupCorp = forcarDuplicidade || (serverOnline ? corporateSeen.current.has(codeAtual) : false);
      if (dupLocal || dupCorp) {
        setStatus("DUPLICIDADE DETECTADA – AÇÃO DO LÍDER NECESSÁRIA");
        addHist({ code: codeAtual, seq, result: "DUPLICIDADE", details: serverOnline ? "Servidor confirmou" : "Servidor offline: risco", ts: Date.now() });
        avancarSequenciaApenas();
        return;
      }
      setStatus("MARCANDO NO LASER");
      await delay(1200 * speedFactor);
      setStatus("INSPECIONANDO CÓDIGO");
      await delay(900 * speedFactor);
      const sucesso = !forcarErro && Math.random() < 0.85;
      if (sucesso) {
        registrarOK();
        return;
      }
      setStatus("RETRABALHO: CLEANING (REMOÇÃO A LASER)");
      await delay(1100 * speedFactor);
      setStatus("RETRABALHO: REMARCAÇÃO");
      await delay(1100 * speedFactor);
      setStatus("INSPECIONANDO APÓS RETRABALHO");
      await delay(900 * speedFactor);
      const sucesso2 = Math.random() < 0.9;
      if (sucesso2) {
        registrarOK("RETRABALHO");
        return;
      }
      setStatus("NOK APÓS RETRABALHO → REFUGO (AGUARDANDO BOCA DE LOBO)");
      addHist({ code: codeAtual, seq, result: "REFUGO", details: "Falha mesmo após retrabalho", ts: Date.now() });
      setRefugoCount((c)=>c+1);
      await waitFor(() => bocaDeLobo || !running || cancelled, 180 * speedFactor);
      if (cancelled || !running) return;
      setBocaDeLobo(false);
      avancarSequenciaApenas();
    };
    ciclo();
    return () => { cancelled = true; };
  }, [loteAtivo, running, remaining, concOk, bocaDeLobo, codeAtual, forcarErro, forcarDuplicidade, serverOnline, speedFactor]);

  function registrarOK(mode = "OK") {
    localSeen.current.add(codeAtual);
    if (serverOnline) corporateSeen.current.add(codeAtual);
    addHist({ code: codeAtual, seq, result: mode === "OK" ? "OK" : "RETRABALHO", ts: Date.now() });
    if (mode === "OK") setOkCount((c)=>c+1); else setRetrabalhoCount((c)=>c+1);
    setProduced((p) => p + 1);
    setRemaining((r) => r - 1);
    avancarSequenciaAJustandoSubLote();
    setStatus("OK – PEÇA LIBERADA");
  }

  function addHist(item) {
    hist.current = [{ ...item }, ...hist.current].slice(0, 50);
    setHistRefresh((v) => v + 1);
  }

  function avancarSequenciaApenas() {
    setSeq((prev) => (prev >= 396 ? 1 : prev + 1));
    setSubLoteMsg((prev) => prev);
  }

  function avancarSequenciaAJustandoSubLote() {
    setSeq((prev) => {
      if (prev >= 396) {
        setSubLoteMsg("Limite 396 alcançado -> iniciando sublote com SEQ 001");
        return 1;
      }
      return prev + 1;
    });
  }

  const onQtyChange = (e) => {
    const v = parseInt(e.target.value || "0", 10);
    setQty(Number.isFinite(v) ? v : 0);
  };

  const onSeqStartChange = (e) => {
    const v = parseInt(e.target.value || "1", 10);
    const s = Number.isFinite(v) ? v : 1;
    setSeqStart(Math.min(396, Math.max(1, s)));
  };

  const onSpeedChange = (e) => {
    const v = parseFloat(e.target.value || "1");
    setSpeedFactor(Number.isFinite(v) ? Math.max(0.5, v) : 1);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Sistema de Gravação a Laser — Preview (Simulação)</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Server className={serverOnline ? "text-green-600" : "text-gray-400"} />
            <span className="text-sm">Servidor</span>
            <Switch checked={serverOnline} onCheckedChange={(v)=>setServerOnline(v)} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Velocidade</span>
            <Input type="number" className="w-20" value={speedFactor} onChange={onSpeedChange} />
            <span className="text-xs text-gray-500">(&gt;1 = mais lento)</span>
          </div>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-xl font-semibold">Setup do Lote</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3"><Input placeholder="Código LS (scan)" value={ls} onChange={(e) => setLs(e.target.value)} />
            <Input placeholder="Código LU (scan)" value={lu} onChange={(e) => setLu(e.target.value)} />
            <Input placeholder="Quantidade (ex: 300)" type="number" value={qty} onChange={onQtyChange} />
            <Input placeholder="Sequência inicial (001 a 396)" type="number" value={seqStart} onChange={onSeqStartChange} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="text-indigo-600" />
              <span>Verificar duplicidade no setup</span>
              <Switch checked={verifyOnSetup} onCheckedChange={(v)=>setVerifyOnSetup(v)} />
            </div>
            {verifyOnSetup && (
              <div className="flex items-center gap-3 flex-wrap">
                <Button size="sm" variant="secondary" onClick={runSetupCheck} disabled={setupChecking}>Rodar verificação agora</Button>
                {setupChecking ? (
                  <div className="flex items-center gap-3">
                    <Progress className="w-48" value={setupProgress} />
                    <span className="text-xs text-gray-500">{setupProgress}%</span>
                  </div>
                ) : null}
                {setupChecked && !setupDupFound ? <Badge className="bg-green-600">Faixa livre</Badge> : null}
                {setupDupFound ? <Badge className="bg-rose-700">Duplicidade: {setupDupFound.code} (SEQ {pad3(setupDupFound.seq)})</Badge> : null}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button onClick={iniciarLote} disabled={loteAtivo || (verifyOnSetup && setupDupFound !== null)}>
              <Play className="mr-2 h-4 w-4" />
              Iniciar Lote
            </Button>
            <Button variant="secondary" onClick={resetExec} disabled={!loteAtivo}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Execução
            </Button>
            <Button variant="destructive" onClick={encerrarLote} disabled={!loteAtivo}>
              <Trash2 className="mr-2 h-4 w-4" />
              Encerrar Lote
            </Button>
          </div>
          {verifyOnSetup && setupDupFound ? <p className="text-rose-700 text-sm">Duplicidade detectada na faixa planejada. Ajuste a sequência inicial ou a quantidade.</p> : null}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="space-y-3 pt-6">
            <h3 className="font-semibold">Controles de Linha</h3>
            <div className="flex items-center gap-2">
              <Cpu className="text-indigo-600" />
              <span>Concentricidade OK</span>
              <Switch checked={concOk} onCheckedChange={(v)=>setConcOk(v)} />
            </div>
            <div className="flex items-center gap-2">
              <Activity className="text-amber-600" />
              <span>Forçar erro de leitura</span>
              <Switch checked={forcarErro} onCheckedChange={(v)=>setForcarErro(v)} />
            </div>
            <div className="flex items-center gap-2">
              <ScanLine className="text-rose-600" />
              <span>Forçar duplicidade (próxima peça)</span>
              <Switch checked={forcarDuplicidade} onCheckedChange={(v)=>setForcarDuplicidade(v)} />
            </div>
            <div className="flex items-center gap-2">
              <ChevronRight />
              <span>Executar ciclo</span>
              <Switch checked={running} onCheckedChange={(v)=>setRunning(v)} />
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-600" />
              <span>Sinal da Boca de Lobo</span>
              <Button size="sm" onClick={() => setBocaDeLobo(true)}>Enviar sinal</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-6">
            <h3 className="font-semibold">Status do Ciclo</h3>
            <div className="flex items-center gap-2">
              <Badge className="bg-slate-800 text-white text-sm px-3 py-1">{status}</Badge>
            </div>
            <div className="text-sm text-gray-600">
              <p><strong>LS:</strong> {ls || "—"} &nbsp; <strong>LU:</strong> {lu || "—"}</p>
              <p><strong>Código atual:</strong> {loteAtivo ? codeAtual : "—"}</p>
            </div>
            <div className="flex items-center justify-center bg-white rounded-xl border p-3">
              <canvas ref={dmCanvasRef} width={160} height={160} />
            </div>
            <Progress value={loteAtivo ? (produced / Math.max(qty, 1)) * 100 : 0} />
            <div className="grid grid-cols-3 text-sm text-gray-700">
              <div><strong>Produzidas</strong><div>{produced}</div></div>
              <div><strong>Restantes</strong><div>{remaining}</div></div>
              <div><strong>Seq.</strong><div>{loteAtivo ? pad3(seq) : "—"}</div></div>
            </div>
            {subLoteMsg ? <p className="text-amber-700 text-xs">{subLoteMsg}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-6">
            <h3 className="font-semibold">Parâmetros do Lote</h3>
            <p><strong>Número do Lote:</strong> {lu || "—"}</p>
            <p><strong>Quantidade planejada:</strong> {qty}</p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2"><Badge className="bg-green-600">OK</Badge><span>{okCount}</span></div>
              <div className="flex items-center gap-2"><Badge className="bg-amber-500">Retrabalho</Badge><span>{retrabalhoCount}</span></div>
              <div className="flex items-center gap-2"><Badge className="bg-red-600">Refugo</Badge><span>{refugoCount}</span></div>
            </div>
            {verifyOnSetup && setupChecked && !setupDupFound ? <p className="text-xs text-green-700">Verificação inicial concluída: sem duplicidades na faixa.</p> : null}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3">Últimas Peças</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {hist.current.length === 0 ? <div className="text-sm text-gray-500">Sem registros ainda…</div> : null}
            {hist.current.map((h, idx) => (
              <div key={idx} className="border rounded-xl p-3 bg-white flex items-center justify-between">
                <div>
                  <div className="font-mono text-sm">{h.code}</div>
                  <div className="text-xs text-gray-500">SEQ {pad3(h.seq)} • {new Date(h.ts).toLocaleTimeString()}</div>
                  {h.details ? <div className="text-xs text-gray-600 mt-1">{h.details}</div> : null}
                </div>
                <div>
                  {h.result === "OK" ? <Badge className="bg-green-600">OK</Badge> : null}
                  {h.result === "RETRABALHO" ? <Badge className="bg-amber-500">Retrabalho</Badge> : null}
                  {h.result === "REFUGO_CONCENTRICIDADE" ? <Badge className="bg-red-600">Refugo Concentricidade</Badge> : null}
                  {h.result === "REFUGO" ? <Badge className="bg-red-600">Refugo</Badge> : null}
                  {h.result === "DUPLICIDADE" ? <Badge className="bg-rose-700">Duplicidade</Badge> : null}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function delay(ms){ return new Promise((res) => setTimeout(res, ms)); }
async function waitFor(cond, step=150){ while(!cond()) await delay(step); }
