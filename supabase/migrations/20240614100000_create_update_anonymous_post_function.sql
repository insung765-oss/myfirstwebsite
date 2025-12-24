-- Function to update an anonymous post after checking password
CREATE OR REPLACE FUNCTION public.update_anonymous_post(
    p_post_id uuid,
    p_check_password text,
    p_new_comment text,
    p_new_rating double precision
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    can_edit boolean;
BEGIN
    -- Use the existing function to check for permission
    SELECT public.can_edit_anonymous_content(p_post_id, 'posts', p_check_password) INTO can_edit;

    IF can_edit THEN
        -- If authorized, perform the update
        UPDATE public.posts
        SET
            comment = p_new_comment,
            rating = p_new_rating
        WHERE id = p_post_id;

        RETURN '수정 성공';
    ELSE
        -- If not authorized, return an error message
        RETURN '비밀번호가 일치하지 않거나 수정 권한이 없습니다.';
    END IF;
END;
$$;
