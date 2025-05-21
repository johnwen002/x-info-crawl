import axios from "axios";
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
      // console.log(media);
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
  page: number = 2
) => {
  var url = "https://x.com/i/api/graphql/lsSh6cdYAKKEu4tWVbIJZA/UserTweets";

  var headers = {
    Authorization: `Bearer ${x_token}`,
    "content-type": "application/json",
    referer: "https://x.com/narendramodi",
    "X-Client-Transaction-Id":
      "WaPb2YS65uvJ00yKLdC6pSarFnCzUSL8RJifuyoVF73KcIVw8Xbm+F10uQyf9H5kt5jBhVoJJjuHHMf7pUxJf0xZZlf6Wg",
    "x-client-uuid": "b1d33f75-cddd-4502-9b99-4d3325712505",
    "X-Csrf-Token":
      "e8d5c28bd7955500ef778feb1d690fc61167b0a4ae81cffa2050bd6ee522292ff003afeecc9854ec533e152a3a167955beefa9a108c4f87a06f70dc2aecc7eeab1d7300ec4676934d0c140120e6fa5bd",
    "x-twitter-active-user": "yes",
    "x-twitter-auth-type": "OAuth2Session",
    "x-twitter-client-language": "en",
    Cookie: `dnt=1; night_mode=2; kdt=gGHYwKzQMGGoiD1LQ0A6H4MvHt2Kwnlc48u8Ge6L; ph_phc_TXdpocbGVeZVm5VJmAsHTMrCofBQu3e0kN8HGMNGTVW_posthog=%7B%22distinct_id%22%3A%2201968709-f948-7eef-9155-e0fb6e216a97%22%2C%22%24sesid%22%3A%5B1746022300036%2C%2201968709-f947-7cec-94d9-51f107c78cdd%22%2C1746022299975%5D%7D; guest_id=v1%3A174669296224078879; guest_id_marketing=v1%3A174669296224078879; guest_id_ads=v1%3A174669296224078879; personalization_id="v1_ztPdqW8vI/cwBpwyWMoLiA=="; auth_token=aab1824326cb841274c014a9cb1fd89bab719572; ct0=e8d5c28bd7955500ef778feb1d690fc61167b0a4ae81cffa2050bd6ee522292ff003afeecc9854ec533e152a3a167955beefa9a108c4f87a06f70dc2aecc7eeab1d7300ec4676934d0c140120e6fa5bd; twid=u%3D1776107572552163328; external_referer=padhuUp37zhpUMHUFfE1LPPLUQ3zhpT8|0|8e8t2xd8A2w%3D; lang=en; __cf_bm=SFGUVafKvvD7PwKBe0.r9cuTVXANasucE_wDWrot6kU-1747712982-1.0.1.1-GSAib.OtY9UzWN6PVj0nvHy5p6h_QNXvsPyCl_MHulXPBnTtJc.P0FZ6mye5wPhi4ug0hltg3kn9slDTCQ9G7msrl620eu0PfqF3_WFBPYM`,
  };
  // console.log(headers);
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
    // console.log(response.headers.getSetCookie);

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