import axios from "axios";
import * as cheerio from "cheerio";

interface TrendingRepository {
  author: string;
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  starsToday: number;
}

// 辅助函数：从字符串中提取数字 (移除逗号等)
function parseStringToNumber(text: string | undefined): number {
  if (!text) return 0;
  const cleanedText = text.trim().replace(/,/g, "");
  const number = parseInt(cleanedText, 10);
  return isNaN(number) ? 0 : number;
}

export async function getDailyGitHubTrending(
  languageParam: string = ""
): Promise<TrendingRepository[]> {
  const baseUrl = "https://github.com/trending";
  const url = languageParam
    ? `${baseUrl}/${encodeURIComponent(languageParam)}`
    : baseUrl;

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9", // 请求英文页面，选择器可能更稳定
  };

  const trendingRepos: TrendingRepository[] = [];

  try {
    const response = await axios.get<string>(url, { headers, timeout: 10000 });
    const html = response.data;
    const $ = cheerio.load(html);

    const repoArticles = $("article.Box-row");

    if (repoArticles.length === 0) {
      console.warn(
        `Warning: No 'article.Box-row' elements found on ${url}. GitHub page structure might have changed.`
      );
      if (html.includes("No results matched your criteria.")) {
        console.info(
          "Info: This might be because there are no trending repositories for the specified language today."
        );
      }
      return [];
    }

    repoArticles.each((index, element) => {
      const article = $(element);

      // 仓库名称和作者
      const titleElement = article.find("h2.h3 a"); // GitHub 结构更新 h1 -> h2
      const rawFullName = titleElement.text().trim().replace(/\s+/g, ""); // 移除所有空格
      const repoUrl = "https://github.com" + titleElement.attr("href");

      const nameParts = rawFullName.split("/");
      const author = nameParts[0]?.trim() || "N/A";
      const repoName = nameParts[1]?.trim() || "N/A";

      // 描述
      const descriptionElement = article.find("p.col-9.color-fg-muted.my-1"); // GitHub 结构更新 class
      const description = descriptionElement.text().trim() || null;

      // 元数据容器
      const metadataDiv = article.find("div.f6.color-fg-muted.mt-2");

      // 语言
      const languageElement = metadataDiv.find(
        'span[itemprop="programmingLanguage"]'
      );
      const language = languageElement.text().trim() || null;

      // 总星星数
      const starsLink = metadataDiv.find(`a[href$="/stargazers"]`);
      const totalStars = parseStringToNumber(starsLink.text());

      // Forks 总数
      const forksLink = metadataDiv.find(`a[href$="/forks"]`); // GitHub 结构更新，寻找包含 /forks 的链接
      const totalForks = parseStringToNumber(forksLink.text());

      // 今日新增星星
      let starsToday = 0;
      const starsTodayElement = metadataDiv.find(
        "span.d-inline-block.float-sm-right"
      ); // 常见位置
      if (
        starsTodayElement.length > 0 &&
        starsTodayElement.text().includes("stars today")
      ) {
        const starsTodayText = starsTodayElement.text().trim();
        const match = starsTodayText.match(/([\d,]+)\s+stars\s+today/);
        if (match && match[1]) {
          starsToday = parseStringToNumber(match[1]);
        }
      } else {
        // 备用查找方式：有时 "stars today" 不在 float-sm-right 的 span 中
        metadataDiv.find("span.d-inline-block").each((i, el) => {
          const spanText = $(el).text().trim();
          if (spanText.includes("stars today")) {
            const match = spanText.match(/([\d,]+)\s+stars\s+today/);
            if (match && match[1]) {
              starsToday = parseStringToNumber(match[1]);
              return false; // break a .each loop
            }
          }
        });
      }

      if (repoName && repoName !== "N/A") {
        // 确保至少有仓库名
        trendingRepos.push({
          author,
          name: repoName,
          url: repoUrl,
          description,
          language,
          stars: totalStars,
          forks: totalForks,
          starsToday,
        });
      }
    });

    return trendingRepos;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Axios request error to ${url}: ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        // console.error("Data:", error.response.data); // Be careful with logging full response data
      }
    } else {
      console.error(
        `Error parsing or processing trending data from ${url}:`,
        error
      );
    }
    return []; // 返回空数组表示失败
  }
}
