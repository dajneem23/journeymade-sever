import prepareCrawlIds from "./prepareCrawlIds";

const expected = [
  {
    period: 0,
    crawl_id: 2023022003,
    from_time: 1676869800,
    to_time: 1676875800
  },
  {
    period: 3,
    crawl_id: 2023022002,
    from_time: 1676859000,
    to_time: 1676865000
  },
  {
    period: 6,
    crawl_id: 2023022001,
    from_time: 1676848200,
    to_time: 1676854200
  },
  {
    period: 12,
    crawl_id: 2023021907,
    from_time: 1676826600,
    to_time: 1676832600
  },
  {
    period: 24,
    crawl_id: 2023021903,
    from_time: 1676783400,
    to_time: 1676789400
  },
  {
    period: 168,
    crawl_id: 2023021303,
    from_time: 1676265000,
    to_time: 1676271000
  },
  {
    period: 720,
    crawl_id: 2023012103,
    from_time: 1674277800,
    to_time: 1674283800
  },
  {
    period: 1440,
    crawl_id: 2022122203,
    from_time: 1671685800,
    to_time: 1671691800
  }
]

describe('.prepareCrawlIds', () => {
  // Assert greeter result
  it('should return true', () => {
    const result = prepareCrawlIds({
      crawl_id: 2023022003,
    });
    
    expect(result).toEqual(expected);
  });

  it('should return true 2', () => {
    const result = prepareCrawlIds({
      crawl_id: 22003,
    });
    
    expect(result).toEqual(expected);
  });
});
