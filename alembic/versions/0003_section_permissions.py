"""Add section permissions

Revision ID: 0003
Revises: 0002
Create Date: 2022-03-21 22:32:46.542465

"""
import fastapi_users_db_sqlalchemy.guid
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "section_permission",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("section_id", sa.String(), nullable=True),
        sa.Column("user_id", fastapi_users_db_sqlalchemy.guid.GUID(), nullable=True),
        sa.Column("level", sa.Enum("EDIT", "NONE", name="permissionlevel"), nullable=True),
        sa.ForeignKeyConstraint(["section_id"], ["sections.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("section_id", "user_id", name="permissions"),
    )
    op.drop_index("ix_oauth_account_account_id", table_name="oauth_account")
    op.drop_index("ix_oauth_account_oauth_name", table_name="oauth_account")
    op.drop_table("oauth_account")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "oauth_account",
        sa.Column("id", sa.CHAR(length=36), nullable=False),
        sa.Column("oauth_name", sa.VARCHAR(length=100), nullable=False),
        sa.Column("access_token", sa.VARCHAR(length=1024), nullable=False),
        sa.Column("expires_at", sa.INTEGER(), nullable=True),
        sa.Column("refresh_token", sa.VARCHAR(length=1024), nullable=True),
        sa.Column("account_id", sa.VARCHAR(length=320), nullable=False),
        sa.Column("account_email", sa.VARCHAR(length=320), nullable=False),
        sa.Column("user_id", sa.CHAR(length=36), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_oauth_account_oauth_name", "oauth_account", ["oauth_name"], unique=False)
    op.create_index("ix_oauth_account_account_id", "oauth_account", ["account_id"], unique=False)
    op.drop_table("section_permission")
    # ### end Alembic commands ###