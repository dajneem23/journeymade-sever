import {
  countPortfolioProjectsByCrawlId,
  getPortfolioProjectsByCrawlId,
} from '../debank/services';
import PortfolioAdapter from './adapter';
import { DATA_SOURCE } from './types/enum.type';
import { IPortfolios } from './types/portfolios.type';
import { RawProjectsType } from './types/rawProjects.type';
import { toTimestamp } from './utils';
import { cleanAmount, cleanPrice } from './utils/parseNumber';

class ProjectsAdapter extends PortfolioAdapter {
  constructor() {
    super({
      id: DATA_SOURCE.DEBANK_PROJECTS,
      raw_limit: 50,
      count_function: countPortfolioProjectsByCrawlId,
    });
  }

  async jobHandler({ data }): Promise<string> {
    const { crawl_id, limit, offset } = data || {};
    if (!crawl_id || !limit) return;

    let projects: RawProjectsType[] = [];
    try {
      projects = await getPortfolioProjectsByCrawlId({
        crawl_id,
        limit,
        offset,
      });
    } catch (e) {
      console.log(
        '🚀 ~ file: projectsAdapter.ts:36 ~ ProjectsAdapter ~ jobHandler ~ e:',
        e,
      );
      throw new Error(e);
    }

    if (!projects || projects.length === 0) return;

    const portfolios = projects
      .map((p: RawProjectsType) => {
        const {
          dao_id,
          platform_token_id,
          portfolio_item_list = [],
        } = p.details || {};

        return portfolio_item_list
          .map((item, idx) =>
            item.asset_token_list
              ?.map((t, tl_idx) => {
                return <IPortfolios>{
                  address: p.user_address as string,
                  ref_id: this.generateRefId([crawl_id, t.symbol, idx, tl_idx]),
                  cid: +crawl_id,

                  symbol: t.symbol as string,
                  amount: cleanAmount(t.amount),
                  price: cleanPrice(t.price),
                  usd_value: t.usd_value || cleanAmount(+t.amount * +t.price),

                  chain: t.chain as string,
                  ctime: toTimestamp(t.crawl_time),

                  dao_id: dao_id,
                  pf_token_id: platform_token_id,
                  pool_id: item.pool?.id,
                  pool_adp_id: item.pool?.adapter_id,
                };
              })
              .flat(),
          )
          .flat();
      })
      .flat();

    return await this.saveData({
      crawl_id,
      offset,
      portfolios,
    });
  }
}

export default ProjectsAdapter;
