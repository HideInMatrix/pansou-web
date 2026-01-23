class SnowflakeID {
  private workerId: bigint;
  private datacenterId: bigint;
  private sequence: bigint;
  private lastTimestamp: bigint;
  private epoch: bigint;

  constructor(workerId: number = 1, datacenterId: number = 1) {
    // 5-bit for worker ID & datacenter ID
    this.workerId = BigInt(workerId & 0x1f);
    this.datacenterId = BigInt(datacenterId & 0x1f);

    this.sequence = BigInt(0);
    this.lastTimestamp = BigInt(-1);
    // 2020-01-01T00:00:00Z，其实你原来的毫秒数是 2020 不是 2019
    this.epoch = BigInt(1577836800000);
  }

  private currentMs(): bigint {
    return BigInt(Date.now());
  }

  public generate(): bigint {
    let ts = this.currentMs();

    if (ts === this.lastTimestamp) {
      // 12-bit sequence number，mask = (1 << 12) - 1 = 0xfff
      const sequenceMask = (BigInt(1) << BigInt(12)) - BigInt(1);
      this.sequence = (this.sequence + BigInt(1)) & sequenceMask;

      if (this.sequence === BigInt(0)) {
        ts = this.tilNextMillis(ts);
      }
    } else {
      this.sequence = BigInt(0);
    }

    this.lastTimestamp = ts;

    return (
      ((ts - this.epoch) << BigInt(22)) | // timestamp 部分
      (this.datacenterId << BigInt(17)) | // datacenter
      (this.workerId << BigInt(12)) |     // worker
      this.sequence                        // 序列号
    );
  }

  private tilNextMillis(lastTs: bigint): bigint {
    let ts = this.currentMs();
    while (ts <= lastTs) {
      ts = this.currentMs();
    }
    return ts;
  }
}

const snowflake = new SnowflakeID();
export default snowflake;
