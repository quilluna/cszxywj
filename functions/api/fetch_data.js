// 文件位置：/functions/api/fetch_data.js
// Cloudflare Pages Function for dynamic video list API
export async function onRequestGet(context) {
  try {
    // 新的POST API端点
    const EXTERNAL_VIDEO_DATA_URL = 'https://open.datadex.com.cn/dexserver/dex-api/v1/data.json';
    
    // 从环境变量获取AppID和API Key
    const APP_ID = context.env.APP_ID || '';
    const API_KEY = context.env.API_KEY || '';
    
    // 生成当前时间戳（秒级）
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    // 构建请求体
    const requestBody = {
      a1: APP_ID,
      a2: API_KEY,
      t1: currentTimestamp
    };
    
    // 发送POST请求获取视频数据
    const response = await fetch(EXTERNAL_VIDEO_DATA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch video data: ${response.status} ${response.statusText}`);
    }
    
    const apiResponse = await response.json();
    
    // 检查响应是否成功
    if (apiResponse.code !== 200) {
      throw new Error(apiResponse.msg || 'API请求失败');
    }
    
    // 返回API响应中的data字段，并设置CORS头
    return new Response(JSON.stringify(apiResponse.data), {
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    // 错误处理
    console.error('Video API error:', error);
    
    return new Response(JSON.stringify({
      error: 'Failed to fetch video data',
      message: error.message
    }), {
      status: 500,
      headers: {
        'content-type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// 处理OPTIONS请求（用于CORS预检）
export async function onRequestOptions(context) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}