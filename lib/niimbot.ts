export const NIIMBOT_SERVICE = 'e7810a71-73ae-499d-8c15-faa9aef0c3f2'
export const NIIMBOT_CHARACTERISTIC = 'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f'

export type PrinterProfile = { model: string; modelId: number; protocol: string; dpi: number; headWidth: number; task: 'b1' | 'v4' }
export const B1_PROFILE: PrinterProfile = { model: 'NIIMBOT B1', modelId: 0x1000, protocol: 'v3 / b1', dpi: 203, headWidth: 384, task: 'b1' }

function frame(cmd: number, data: number[] = []) {
  const len = data.length
  const crc = [cmd, len, ...data].reduce((a, b) => a ^ b, 0)
  return new Uint8Array([0x55, 0x55, cmd, len, ...data, crc, 0xaa, 0xaa])
}

export function mmToPx(mm: number, dpi = 203) { return Math.round(mm * dpi / 25.4) }
export function packBitmap(rows: Uint8Array[], width: number) {
  const stride = Math.ceil(width / 8)
  return rows.map((row, index) => {
    const pixels = new Uint8Array(stride)
    let total = 0
    for (let x = 0; x < width; x++) if (row[x]) { pixels[x >> 3] |= 0x80 >> (x & 7); total++ }
    return { index, pixels, total }
  })
}

export class NiimbotB1Client {
  device?: BluetoothDevice
  characteristic?: BluetoothRemoteGATTCharacteristic
  profile = B1_PROFILE
  connected = false
  onStatus?: (status: string) => void
  async connect() {
    if (!('bluetooth' in navigator)) throw new Error('Web Bluetooth wird in diesem Browser nicht unterstützt. Bitte Chrome oder Edge über HTTPS verwenden.')
    this.device = await navigator.bluetooth.requestDevice({ filters: [{ namePrefix: 'B1' }, { namePrefix: 'B2' }, { namePrefix: 'D1' }], optionalServices: [NIIMBOT_SERVICE] })
    this.device.addEventListener('gattserverdisconnected', () => { this.connected = false; this.onStatus?.('Getrennt') })
    const server = await this.device.gatt?.connect()
    const service = await server?.getPrimaryService(NIIMBOT_SERVICE)
    this.characteristic = await service?.getCharacteristic(NIIMBOT_CHARACTERISTIC)
    await this.characteristic?.startNotifications()
    await this.write(new Uint8Array([0x03, ...frame(0xc1, [1])]))
    this.connected = true
    this.onStatus?.('Verbunden')
  }
  async write(data: Uint8Array) { if (!this.characteristic) throw new Error('Kein Drucker verbunden'); await this.characteristic.writeValueWithoutResponse(data) }
  async testPrint(copies = 1) {
    if (!this.connected) throw new Error('Bitte zuerst einen Drucker verbinden.')
    const width = this.profile.headWidth, height = mmToPx(30, this.profile.dpi), stride = Math.ceil(width / 8)
    const rows = Array.from({ length: height }, (_, y) => { const r = new Uint8Array(width); for (let x = 0; x < width; x++) r[x] = (x < 8 || x >= width - 8 || y < 8 || y >= height - 8 || (x > width * .45 && x < width * .55 && y > height * .2 && y < height * .8)) ? 1 : 0; return r })
    await this.write(frame(0xa5, [1])); await new Promise(r => setTimeout(r, 60))
    for (const sub of [8, 11, 13, 10, 7, 3, 12, 9]) { await this.write(frame(0x40, [sub])); await new Promise(r => setTimeout(r, 18)) }
    await this.write(frame(0xdc, [4])); await this.write(frame(0x21, [3])); await this.write(frame(0x23, [1]));
    await this.write(frame(0x01, [0, copies, 0, 0, 0, 0, 0])); await this.write(frame(0x03, [1])); await this.write(frame(0x13, [height >> 8, height & 255, width >> 8, width & 255, 0, copies]))
    const packed = packBitmap(rows, width)
    for (const row of packed) { const data = row.total === 0 ? [row.index >> 8, row.index & 255, 1] : [row.index >> 8, row.index & 255, 0, row.total >> 8, row.total & 255, 1, ...row.pixels]; await this.write(frame(row.total === 0 ? 0x84 : 0x85, data)); await new Promise(r => setTimeout(r, 10)) }
    await this.write(frame(0xe3, [1])); await new Promise(r => setTimeout(r, 1800)); await this.write(frame(0xf3, [1]))
  }
  disconnect() { this.device?.gatt?.disconnect() }
}

export function createLabelRows(width: number, height: number, elements: { type: string; x: number; y: number; w: number; h: number }[]) {
  const rows = Array.from({ length: height }, () => new Uint8Array(width))
  for (const el of elements) for (let y = Math.max(0, el.y); y < Math.min(height, el.y + el.h); y++) for (let x = Math.max(0, el.x); x < Math.min(width, el.x + el.w); x++) rows[y][x] = el.type === 'rectangle' ? (x === el.x || y === el.y || x === el.x + el.w - 1 || y === el.y + el.h - 1 ? 1 : 0) : 1
  return rows
}

export function exportJson(data: unknown, filename: string) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); a.download = filename; a.click(); URL.revokeObjectURL(a.href) }
export function saveTemplate(template: unknown) { const request = indexedDB.open('niimbot-label-studio', 1); request.onupgradeneeded = () => request.result.createObjectStore('templates', { keyPath: 'id' }); request.onsuccess = () => { const db = request.result; db.transaction('templates', 'readwrite').objectStore('templates').put(template) } }
export function loadTemplates(): Promise<any[]> { return new Promise(resolve => { const r = indexedDB.open('niimbot-label-studio', 1); r.onupgradeneeded = () => r.result.createObjectStore('templates', { keyPath: 'id' }); r.onsuccess = () => { const q = r.result.transaction('templates').objectStore('templates').getAll(); q.onsuccess = () => resolve(q.result) }; r.onerror = () => resolve([]) }) }
export function frameForTest(cmd: number, data: number[]) { return frame(cmd, data) }

export const RFID_NOTE = 'Der B1 kann laut NiimBlue-Dokumentation ohne gültigen RFID-Tag Daten annehmen, druckt dann aber typischerweise mit sehr niedriger oder null Dichte. Die App umgeht keine Firmware-Sperre.'
export const SOURCES = ['MultiMote/niimblue', 'iscarelli/niimbot-web-bluetooth', 'MultiMote/niimbluelib', 'MultiMote/niimblue-node']
export const LICENSE_NOTE = 'Die Bibliotheken sind Open Source; vor einer Weiterverteilung der Protokollimplementierung bitte die jeweilige LICENSE-Datei der Original-Repositories prüfen.'
