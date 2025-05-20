import axios from "axios";
// import OpenAI from "openai";
import { z } from "zod";
import { calculateStringHash } from "./utils";

async function gatherLegacyFromData(
  entries: any[],
  filterNested?: string[],
  userId?: number | string
) {
  const tweets: any[] = [];
  const filteredEntries: any[] = [];
  for (const entry of entries) {
    const entryId = entry.entryId;
    if (entryId) {
      if (entryId.startsWith("tweet-")) {
        filteredEntries.push(entry);
      } else if (entryId.startsWith("profile-grid-0-tweet-")) {
        filteredEntries.push(entry);
      }
      if (filterNested && filterNested.some((f) => entryId.startsWith(f))) {
        filteredEntries.push(...entry.content.items);
      }
    }
  }
  for (const entry of filteredEntries) {
    if (entry.entryId) {
      const content = entry.content || entry.item;
      let tweet =
        content?.content?.tweetResult?.result ||
        content?.itemContent?.tweet_results?.result;
      if (tweet && tweet.tweet) {
        tweet = tweet.tweet;
      }
      if (tweet) {
        const retweet = tweet.legacy?.retweeted_status_result?.result;
        for (const t of [tweet, retweet]) {
          if (!t?.legacy) {
            continue;
          }
          t.legacy.user =
            t.core?.user_result?.result?.legacy ||
            t.core?.user_results?.result?.legacy;
          t.legacy.id_str = t.rest_id; // avoid falling back to conversation_id_str elsewhere
          const quote =
            t.quoted_status_result?.result?.tweet ||
            t.quoted_status_result?.result;
          if (quote) {
            t.legacy.quoted_status = quote.legacy;
            t.legacy.quoted_status.user =
              quote.core.user_result?.result?.legacy ||
              quote.core.user_results?.result?.legacy;
          }
          if (t.note_tweet) {
            const tmp = t.note_tweet.note_tweet_results.result;
            t.legacy.entities.urls = tmp.entity_set.urls;
            if (tmp.entity_set.urls) {
              for (const url of tmp.entity_set.urls) {
                tmp.text = tmp.text.replaceAll(url["url"], url["expanded_url"]);
              }
            }
            t.legacy.full_text = tmp.text;
          }
        }
        const legacy = tweet.legacy;
        if (legacy) {
          if (retweet) {
            legacy.retweeted_status = retweet.legacy;
          }
          if (userId === undefined || legacy.user_id_str === userId + "") {
            tweets.push(legacy);
          }
        }
      }
    }
  }
  const full_results = [];
  // console.log(tweets);
  for (const tweet of tweets) {
    let full_text =
      tweet?.retweeted_status_result?.result?.quoted_status_result?.result
        ?.legacy?.full_text ||
      tweet?.retweeted_status_result?.result?.legacy?.full_text ||
      "";
    let medias =
      tweet?.entities?.media ||
      tweet?.retweeted_status_result?.result?.legacy?.entries?.media ||
      tweet?.retweeted_status_result?.result?.legacy?.extended_entities
        ?.media ||
      tweet?.retweeted_status?.entities?.media ||
      tweet?.retweeted_status_result?.result?.legacy?.quoted_status?.entities
        ?.media;

    let quote_media =
      tweet?.quoted_status_result?.result?.legacy?.entities?.media;
    let note_media = tweet?.note_tweet_results?.result?.legacy?.entities?.media;

    let urls =
      tweet?.entities?.urls ||
      tweet?.retweeted_status_result?.result?.legacy?.entries?.urls ||
      tweet?.retweeted_status_result?.result?.legacy?.entities?.urls ||
      tweet?.quoted_status_result?.result?.legacy?.entities?.urls;

    let extend_urls =
      tweet?.retweeted_status_result?.result?.legacy?.entities?.urls ||
      tweet?.quoted_status_result?.result?.legacy?.entities?.urls;

    if (!medias) {
      medias = [];
    }

    if (urls) {
      medias.push(...urls);
    }

    if (extend_urls) {
      medias.push(...extend_urls);
    }
    if (quote_media) {
      medias.push(...quote_media);
    }

    if (note_media) {
      medias.push(...note_media);
    }

    let media_urls = medias.map((it: any) => {
      let real_url = it?.expanded_url;
      if (real_url) {
        if (real_url.indexOf("x.com")) {
          real_url = it?.media_url_https || it?.expanded_url || it?.url;
        }
      }

      return {
        [it?.url]: real_url,
      };
    });
    for (const media of media_urls) {
      console.log(media);
      let key = Object.keys(media)[0];
      full_text = full_text.replaceAll(key, media[key]);
    }

    full_results.push({ full_text, sha: await calculateStringHash(full_text) });
  }

  return full_results;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const x_crawler = async (
  id: number,
  x_token: string,
  page: number = 1
) => {
  var url = "https://x.com/i/api/graphql/HeWHY26ItCfUmm1e6ITjeA/UserTweets";

  var headers = {
    authority: "x.com",
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9",
    Authorization: `Bearer ${x_token}`,
    "cache-control": "no-cache",
    "content-type": "application/json",
    dnt: "1",
    pragma: "no-cache",
    referer: "https://x.com/narendramodi",
    "x-twitter-active-user": "yes",
    "x-twitter-auth-type": "OAuth2Session",
    "x-twitter-client-language": "en",
    "x-csrf-token":
      "b3b37a17ef37c4b4343a83106cb9fd46b7489b916636a5652bb555c09d594a9b848cb8d65055d50b21adabaf6cbe607b36427245c1cdc5abbb1025bb41051e642de4048766e75ce11a86555a01774b05",
    Cookie:
      'dnt=1; guest_id=v1%3A169665510452962767; night_mode=2; guest_id_marketing=v1%3A169665510452962767; guest_id_ads=v1%3A169665510452962767; kdt=gGHYwKzQMGGoiD1LQ0A6H4MvHt2Kwnlc48u8Ge6L; auth_token=c76a22e080695d2cbc68b340e405da1d1562f012; ct0=b3b37a17ef37c4b4343a83106cb9fd46b7489b916636a5652bb555c09d594a9b848cb8d65055d50b21adabaf6cbe607b36427245c1cdc5abbb1025bb41051e642de4048766e75ce11a86555a01774b05; twid=u%3D1776107572552163328; personalization_id="v1_xHzgKiL3XaxxCGcCj3EUFg=="; lang=en; __cf_bm=26gHIIactVSBDOOr.rav_mdInHXiv00zp2iMm6dqO0E-1745914495-1.0.1.1-q4RLCEInR1TFmhDjsilhd2nUdB31KUzmwE8I0P4dL8SeStDYM1q4CKipVbV4dofTB8JwtpmGBbJB6eFdbAqjBI7iyDmpQ1XKE0_RBGVn6Q4',
  };

  const features = JSON.stringify({
    rweb_video_screen_enabled: false,
    profile_label_improvements_pcf_label_in_post_enabled: true,
    rweb_tipjar_consumption_enabled: true,
    verified_phone_label_enabled: false,
    creator_subscriptions_tweet_preview_api_enabled: true,
    responsive_web_graphql_timeline_navigation_enabled: true,
    responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    premium_content_api_read_enabled: false,
    communities_web_enable_tweet_community_results_fetch: true,
    c9s_tweet_anatomy_moderator_badge_enabled: true,
    responsive_web_grok_analyze_button_fetch_trends_enabled: false,
    responsive_web_grok_analyze_post_followups_enabled: true,
    responsive_web_jetfuel_frame: false,
    responsive_web_grok_share_attachment_enabled: true,
    articles_preview_enabled: true,
    responsive_web_edit_tweet_api_enabled: true,
    graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
    view_counts_everywhere_api_enabled: true,
    longform_notetweets_consumption_enabled: true,
    responsive_web_twitter_article_tweet_consumption_enabled: true,
    tweet_awards_web_tipping_enabled: false,
    responsive_web_grok_show_grok_translated_post: false,
    responsive_web_grok_analysis_button_from_backend: true,
    creator_subscriptions_quote_tweet_preview_enabled: false,
    freedom_of_speech_not_reach_fetch_enabled: true,
    standardized_nudges_misinfo: true,
    tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled:
      true,
    longform_notetweets_rich_text_read_enabled: true,
    longform_notetweets_inline_media_enabled: true,
    responsive_web_grok_image_annotation_enabled: true,
    responsive_web_enhance_cards_enabled: false,
  });

  const fieldToggles = JSON.stringify({ withArticlePlainText: false });

  const all_results = [];
  const variables: {
    userId: number;
    count: number;
    includePromotedContent: boolean;
    withQuickPromoteEligibilityTweetFields: boolean;
    withVoice: boolean;
    cursor?: string;
  } = {
    userId: id,
    count: 20,
    includePromotedContent: true,
    withQuickPromoteEligibilityTweetFields: true,
    withVoice: true,
  };
  for (let i = 0; i <= page; i++) {
    await delay(3000);
    const response = await axios.get(url, {
      params: { variables: JSON.stringify(variables), features, fieldToggles },
      headers,
    });

    const instructions =
      response.data?.data?.user.result.timeline.timeline.instructions ||
      response.data?.data?.user.result.timeline_v2.timeline.instructions;
    for (const instruction of instructions) {
      if (instruction?.entries) {
        // console.log(instruction?.entries);
        const full_text_result = await gatherLegacyFromData(
          instruction?.entries
        );
        all_results.push(...full_text_result);

        for (const entrie of instruction?.entries) {
          if (entrie.content.entryType == "TimelineTimelineCursor") {
            variables.cursor = entrie.content.value;
          }
        }
      }
    }
  }

  return all_results;
};

// export const manage_x_content = async (
//   x_user_id: number,
//   x_token: string,
//   apiKey: string
// ) => {
//   const response = await x_crawler(x_user_id, x_token);
//   const itemSchema = z.object({
//     user_name: z.string(),
//     content: z.string(),
//     media_urls: z.array(z.string()),
//     summary: z.string(),
//   });
//   const schema = z.object({
//     results: z.array(itemSchema),
//   });

//   const system_message = `
//   资料内容：${JSON.stringify(response)} 

//   你是一个乐于助人的小助手。 现在你需要根据材料内容帮我整理资料。 要求如下：
//   1. 严格根据材料内容， 不要胡编乱造，一般有20条内容， 确保不要遗漏！
//   2. 文字内容要全文，要完整，如果带有短链接， 要将短链接替换成对应的正常链接。 正常的链接从对应的 JSON 里面寻找， 要一一对应，不要对应错误！
//   3. 根据你收集到的信息，生成小红书式的有意思的总结. 要幽默风趣，带上表情符号
//   `;

//   // console.log(system_message);
//   const openai = new OpenAI({
//     baseURL: "https://openrouter.ai/api/v1",
//     apiKey,
//   });

//   // const ai_res = await genText(apiKey, system_message, schema);
//   const completion = await openai.beta.chat.completions.parse({
//     model: "qwen/qwen3-235b-a22b",
//     messages: [
//       { role: "system", content: system_message },
//       { role: "user", content: "start!" },
//     ],
//   });
//   console.log("++++++++++++++++++");
//   console.log(completion);
//   return completion.choices[0].message.content;
// };
