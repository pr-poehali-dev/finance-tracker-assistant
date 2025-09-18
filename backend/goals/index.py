import json
import os
import psycopg
from datetime import datetime, date
from decimal import Decimal
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage user financial goals and progress tracking
    Args: event - dict with httpMethod, body, queryStringParameters
          context - object with attributes: request_id, function_name, function_version, memory_limit_in_mb
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-ID',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    # Get database connection string
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Database connection not configured'})
        }
    
    # Get user ID from headers
    headers = event.get('headers', {})
    user_id = headers.get('X-User-ID') or headers.get('x-user-id')
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'User ID required in X-User-ID header'})
        }
    
    try:
        user_id = int(user_id)
    except ValueError:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Invalid user ID'})
        }
    
    try:
        with psycopg.connect(dsn) as conn:
            with conn.cursor() as cur:
                if method == 'GET':
                    return handle_get_goals(cur, user_id, event.get('queryStringParameters', {}))
                elif method == 'POST':
                    body_data = json.loads(event.get('body', '{}'))
                    return handle_create_goal(cur, user_id, body_data)
                elif method == 'PUT':
                    body_data = json.loads(event.get('body', '{}'))
                    goal_id = body_data.get('id')
                    return handle_update_goal(cur, user_id, goal_id, body_data)
                elif method == 'DELETE':
                    query_params = event.get('queryStringParameters', {})
                    goal_id = query_params.get('id')
                    return handle_delete_goal(cur, user_id, goal_id)
                else:
                    return {
                        'statusCode': 405,
                        'headers': {
                            'Access-Control-Allow-Origin': '*',
                            'Content-Type': 'application/json'
                        },
                        'body': json.dumps({'error': 'Method not allowed'})
                    }
    
    except psycopg.Error as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': f'Database error: {str(e)}'})
        }
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Invalid JSON'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': f'Server error: {str(e)}'})
        }

def decimal_default(obj):
    """JSON serializer for Decimal objects"""
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, date):
        return obj.isoformat()
    raise TypeError

def handle_get_goals(cur, user_id: int, params: Dict[str, Any]) -> Dict[str, Any]:
    """Get financial goals for user"""
    goal_id = params.get('id')
    
    if goal_id:
        # Get specific goal
        cur.execute("""
            SELECT id, title, target_amount, current_amount, deadline_date, 
                   is_completed, created_at, updated_at
            FROM financial_goals 
            WHERE id = %s AND user_id = %s
        """, (goal_id, user_id))
        
        goal = cur.fetchone()
        if not goal:
            return {
                'statusCode': 404,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({'error': 'Goal not found'})
            }
        
        goal_data = {
            'id': goal[0],
            'title': goal[1],
            'target': float(goal[2]),
            'current': float(goal[3]),
            'deadline': goal[4].isoformat(),
            'is_completed': goal[5],
            'created_at': goal[6].isoformat(),
            'updated_at': goal[7].isoformat(),
            'progress': (float(goal[3]) / float(goal[2])) * 100 if goal[2] > 0 else 0
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'goal': goal_data})
        }
    
    else:
        # Get all goals for user
        status_filter = params.get('status')  # 'active', 'completed', 'all'
        
        query = """
            SELECT id, title, target_amount, current_amount, deadline_date, 
                   is_completed, created_at, updated_at
            FROM financial_goals 
            WHERE user_id = %s
        """
        query_params = [user_id]
        
        if status_filter == 'completed':
            query += " AND is_completed = true"
        elif status_filter == 'active' or not status_filter:
            query += " AND is_completed = false"
        
        query += " ORDER BY created_at DESC"
        
        cur.execute(query, query_params)
        goals = cur.fetchall()
        
        result = []
        for goal in goals:
            progress = (float(goal[3]) / float(goal[2])) * 100 if goal[2] > 0 else 0
            result.append({
                'id': goal[0],
                'title': goal[1],
                'target': float(goal[2]),
                'current': float(goal[3]),
                'deadline': goal[4].isoformat(),
                'is_completed': goal[5],
                'created_at': goal[6].isoformat(),
                'updated_at': goal[7].isoformat(),
                'progress': progress
            })
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'goals': result,
                'total': len(result)
            })
        }

def handle_create_goal(cur, user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
    """Create new financial goal"""
    title = data.get('title', '').strip()
    target_amount = data.get('target')
    deadline_date = data.get('deadline')
    current_amount = data.get('current', 0)
    
    # Validation
    if not title:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Title is required'})
        }
    
    if not target_amount or float(target_amount) <= 0:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Target amount must be positive'})
        }
    
    if not deadline_date:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Deadline date is required'})
        }
    
    try:
        deadline_parsed = datetime.fromisoformat(deadline_date.replace('Z', '+00:00')).date()
        if deadline_parsed <= date.today():
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({'error': 'Deadline must be in the future'})
            }
    except ValueError:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Invalid deadline date format'})
        }
    
    if current_amount < 0:
        current_amount = 0
    
    # Insert goal
    cur.execute("""
        INSERT INTO financial_goals (user_id, title, target_amount, current_amount, deadline_date)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id, created_at, updated_at
    """, (user_id, title, target_amount, current_amount, deadline_parsed))
    
    goal_id, created_at, updated_at = cur.fetchone()
    
    progress = (float(current_amount) / float(target_amount)) * 100 if target_amount > 0 else 0
    
    return {
        'statusCode': 201,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({
            'success': True,
            'goal': {
                'id': goal_id,
                'title': title,
                'target': float(target_amount),
                'current': float(current_amount),
                'deadline': deadline_parsed.isoformat(),
                'is_completed': False,
                'created_at': created_at.isoformat(),
                'updated_at': updated_at.isoformat(),
                'progress': progress
            }
        })
    }

def handle_update_goal(cur, user_id: int, goal_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
    """Update existing financial goal"""
    if not goal_id:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Goal ID is required'})
        }
    
    # Check if goal belongs to user
    cur.execute("SELECT id FROM financial_goals WHERE id = %s AND user_id = %s", (goal_id, user_id))
    if not cur.fetchone():
        return {
            'statusCode': 404,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Goal not found'})
        }
    
    # Build update query dynamically
    updates = []
    params = []
    
    if 'title' in data and data['title'].strip():
        updates.append("title = %s")
        params.append(data['title'].strip())
    
    if 'target' in data and float(data['target']) > 0:
        updates.append("target_amount = %s")
        params.append(data['target'])
    
    if 'current' in data and float(data['current']) >= 0:
        updates.append("current_amount = %s")
        params.append(data['current'])
    
    if 'deadline' in data:
        try:
            deadline_parsed = datetime.fromisoformat(data['deadline'].replace('Z', '+00:00')).date()
            updates.append("deadline_date = %s")
            params.append(deadline_parsed)
        except ValueError:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({'error': 'Invalid deadline date format'})
            }
    
    if 'is_completed' in data:
        updates.append("is_completed = %s")
        params.append(data['is_completed'])
    
    if not updates:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'No valid fields to update'})
        }
    
    # Add updated_at
    updates.append("updated_at = CURRENT_TIMESTAMP")
    params.extend([goal_id, user_id])
    
    cur.execute(f"""
        UPDATE financial_goals 
        SET {', '.join(updates)}
        WHERE id = %s AND user_id = %s
        RETURNING id, title, target_amount, current_amount, deadline_date, 
                  is_completed, created_at, updated_at
    """, params)
    
    updated_goal = cur.fetchone()
    progress = (float(updated_goal[3]) / float(updated_goal[2])) * 100 if updated_goal[2] > 0 else 0
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({
            'success': True,
            'goal': {
                'id': updated_goal[0],
                'title': updated_goal[1],
                'target': float(updated_goal[2]),
                'current': float(updated_goal[3]),
                'deadline': updated_goal[4].isoformat(),
                'is_completed': updated_goal[5],
                'created_at': updated_goal[6].isoformat(),
                'updated_at': updated_goal[7].isoformat(),
                'progress': progress
            }
        })
    }

def handle_delete_goal(cur, user_id: int, goal_id: str) -> Dict[str, Any]:
    """Delete financial goal"""
    if not goal_id:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Goal ID is required'})
        }
    
    try:
        goal_id = int(goal_id)
    except ValueError:
        return {
            'statusCode': 400,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Invalid goal ID'})
        }
    
    # Delete goal
    cur.execute("DELETE FROM financial_goals WHERE id = %s AND user_id = %s", (goal_id, user_id))
    
    if cur.rowcount == 0:
        return {
            'statusCode': 404,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Goal not found'})
        }
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({'success': True, 'message': 'Goal deleted'})
    }