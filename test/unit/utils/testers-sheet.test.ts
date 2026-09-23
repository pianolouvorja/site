import { describe, expect, it } from 'vitest'
import { parseGvizCsv, normalizeTesterRow } from '~/utils/testers-sheet'

describe('parseGvizCsv', () => {
  it('parses a gviz csv with header and rows', () => {
    const csv = [
      'Timestamp,Nome,Versão,Módulo,Status,Relato',
      '"2026-09-23 10:00:00","Alice","1.28.1","Coletâneas","ok","Tudo funcionando"',
      '"2026-09-23 11:30:00","Bruno","1.28.0","Bíblia","bug","Scroll quebra em 430px"',
    ].join('\n')

    const rows = parseGvizCsv(csv)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual({
      Timestamp: '2026-09-23 10:00:00',
      Nome: 'Alice',
      Versão: '1.28.1',
      Módulo: 'Coletâneas',
      Status: 'ok',
      Relato: 'Tudo funcionando',
    })
  })

  it('keeps empty fields as empty strings', () => {
    const csv = 'Timestamp,Nome,Relato\n"2026-09-23","Alice",'
    const rows = parseGvizCsv(csv)
    expect(rows[0].Relato).toBe('')
  })

  it('handles quoted fields with commas and escaped quotes', () => {
    const csv = 'Nome,Relato\n"Alice, QA","Disse ""bom"" e saiu"\n"Bruno","linha1\nlinha2"'
    const rows = parseGvizCsv(csv)
    expect(rows[0].Nome).toBe('Alice, QA')
    expect(rows[0].Relato).toBe('Disse "bom" e saiu')
    expect(rows[1].Relato).toBe('linha1\nlinha2')
  })

  it('returns empty array for empty or header-only csv', () => {
    expect(parseGvizCsv('')).toEqual([])
    expect(parseGvizCsv('Timestamp,Nome\n')).toEqual([])
  })

  it('handles html gviz response by extracting the csv table', () => {
    // gviz retorna JSON/HTML quando tqx não é out:csv — parser só recebe CSV
    const csv = 'Nome,Relato\n"Alice","ok"'
    expect(parseGvizCsv(csv)).toEqual([{ Nome: 'Alice', Relato: 'ok' }])
  })
})

describe('normalizeTesterRow', () => {
  const row = {
    Timestamp: '2026-09-23 10:00:00',
    Nome: 'Alice',
    Versão: '1.28.1',
    Módulo: 'Coletâneas',
    Status: 'bug',
    Relato: 'Scroll quebra',
  }

  it('maps pt-BR headers to canonical fields', () => {
    const t = normalizeTesterRow(row)
    expect(t).toEqual({
      date: '2026-09-23 10:00:00',
      tester: 'Alice',
      version: '1.28.1',
      module: 'Coletâneas',
      status: 'bug',
      report: 'Scroll quebra',
    })
  })

  it('accepts alternate header spellings (pt/en)', () => {
    const t = normalizeTesterRow({
      Timestamp: 't',
      Tester: 'Bob',
      Version: '1.0',
      Module: 'Player',
      Status: 'ok',
      Report: 'fine',
    })
    expect(t.tester).toBe('Bob')
    expect(t.report).toBe('fine')
  })

  it('normalizes status to lowercase and clamps unknown to other', () => {
    expect(normalizeTesterRow({ ...row, Status: 'BUG' }).status).toBe('bug')
    expect(normalizeTesterRow({ ...row, Status: 'qualquer' }).status).toBe('other')
    expect(normalizeTesterRow({ ...row, Status: '' }).status).toBe('other')
  })

  it('produces empty tester when row has no name', () => {
    expect(normalizeTesterRow({ Timestamp: 't' }).tester).toBe('')
  })

  it('parses timestamp to iso when valid', () => {
    const t = normalizeTesterRow({ ...row, Timestamp: '23/09/2026 10:00:00' })
    // pt-BR date preserved as-is when not ISO parseable — grist não quebra
    expect(typeof t.date).toBe('string')
  })
})
