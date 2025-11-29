import re
from jinja2 import FileSystemLoader, Environment

def parse_markdown_links(md_content):
    """
    从 Markdown 内容中解析出所有链接，并按标题分类。
    """
    categories = []
    current_category = None

    # 按行分割内容
    lines = md_content.strip().split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # 匹配二级标题作为分类
        heading_match = re.match(r'^##\s*(.*)', line)
        if heading_match:
            category_name = heading_match.group(1).strip()
            current_category = {
                'name': category_name,
                'links': []
            }
            categories.append(current_category)
        else:
            # 匹配链接
            link_match = re.match(r'\[(.*?)\]\((.*?)\)', line)
            if link_match and current_category:
                link_name = link_match.group(1).strip()
                link_url = link_match.group(2).strip()
                current_category['links'].append({
                    'name': link_name,
                    'url': link_url
                })
    
    return categories

def generate_html_page(categories):
    """
    使用 Jinja2 模板引擎渲染 HTML 页面。
    """
    env = Environment(loader=FileSystemLoader("."))
    template = env.get_template("nav-template.html")
    
    return template.render(categories=categories)

def main():
    """
    主函数：读取文件，解析链接，生成 HTML。
    """
    try:
        # 读取 Markdown 文件内容
        with open('nav.md', 'r', encoding='utf-8') as f:
            md_content = f.read()

        # 解析链接
        categories = parse_markdown_links(md_content)

        # 生成 HTML 内容
        html_content = generate_html_page(categories)

        # 将生成的 HTML 写入 index.html 文件
        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(html_content)

        print("✔ 导航页 'index.html' 已成功生成！")
        print("请确保 'nav-style.css' 和 'nav-template.html' 文件与 'index.html' 在同一目录下。")

    except FileNotFoundError as e:
        print(f"❌ 错误：文件 '{e.filename}' 未找到。请确保所有必要文件都存在。")
    except Exception as e:
        print(f"❌ 发生了一个错误：{e}")

if __name__ == "__main__":
    main()
